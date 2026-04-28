import chatService from '../services/chatService.js'
import billingContextService from '../services/billingContextService.js'
import {
  buildRevenueQuery,
  detectIntent,
  resolveDateRange,
  revenueResponse,
} from '../services/chatbot/index.js'

export class ChatController {
  async health(req, res) {
    const result = await chatService.checkHealth()
    return res.status(result.ok ? 200 : 503).json(result)
  }

  async test(req, res) {
    console.log('Test endpoint called')
    return res.json({ success: true, message: 'Test endpoint working' })
  }

  async chat(req, res) {
    console.log('Chat controller called with body:', req.body)
    try {
      const {
        message,
        history = [],
        includeBillingContext = true,
        date = null,
      } = req.body

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Mensagem inválida. Envie um texto não vazio.',
        })
      }

      if (!Array.isArray(history)) {
        return res.status(400).json({
          success: false,
          error: 'Histórico inválido. Deve ser um array.',
        })
      }

      const period = resolveDateRange(message)
      const resolvedDate = date || period.startDate
      period.startDate = resolvedDate
      period.endDate = resolvedDate
      const intent = detectIntent(message)
      const intentName = intent.intent

      // Se quiser uma resposta direta e formatada (bypass LLM)
      const forceDirectResponse = req.body.direct === true

      if (includeBillingContext && intentName === 'revenue' && forceDirectResponse) {
        const revenueData = await buildRevenueQuery(period, billingContextService, {
          message,
        })

        if (!revenueData.success) {
          return res.status(500).json({
            success: false,
            error: 'Erro ao buscar dados de faturamento',
          })
        }

        return res.json({
          success: true,
          reply: revenueResponse(revenueData.data, period),
          model: null,
          hasBillingData: true,
          billingData: revenueData,
          intent,
          period,
        })
      }

      const result = await chatService.chat(
        message,
        history,
        includeBillingContext,
        resolvedDate
      )
      console.log('Chat service returned:', result)
      console.log('About to send response')
      return res.json(result)
    } catch (error) {
      console.error('Erro no chat:', error)
      return res.status(500).json({
        success: false,
        error: 'Erro interno no servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }

  async streamChat(req, res) {
    try {
      const { message, history = [], includeBillingContext = true } = req.body

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Mensagem inválida',
        })
      }

      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const period = resolveDateRange(message)
      const intent = detectIntent(message)
      const intentName = intent.intent
      const forceDirectResponse = req.body.direct === true

      const resolvedDate = req.body.date || period.startDate
      period.startDate = resolvedDate
      period.endDate = resolvedDate

      if (includeBillingContext && intentName === 'revenue' && forceDirectResponse) {
        const revenueData = await buildRevenueQuery(period, billingContextService, {
          message,
        })

        if (!revenueData.success) {
          res.write(`data: ${JSON.stringify({
            error: 'Erro ao buscar dados de faturamento',
          })}\n\n`)
          return res.end()
        }

        res.write(`data: ${JSON.stringify({
          message: {
            role: 'assistant',
            content: revenueResponse(revenueData.data, period),
          },
          done: true,
          billingData: revenueData,
          intent,
          period,
        })}\n\n`)
        return res.end()
      }

      const stream = await chatService.streamChat(
        message,
        history,
        includeBillingContext,
        resolvedDate
      )
      const reader = stream.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          const lines = text.split('\n').filter(line => line.trim())

          for (const line of lines) {
            if (line) {
              res.write(`data: ${line}\n\n`)
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      res.end()
    } catch (error) {
      console.error('Erro no stream:', error)
      res.status(500).json({
        success: false,
        error: 'Erro ao processar stream',
      })
    }
  }
}

export default new ChatController()

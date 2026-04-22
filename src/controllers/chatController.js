import chatService from '../services/chatService.js'

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

      const result = await chatService.chat(
        message,
        history,
        includeBillingContext,
        date
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

      const stream = await chatService.streamChat(
        message,
        history,
        includeBillingContext,
        req.body.date ?? null
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

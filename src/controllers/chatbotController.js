import chatService from '../services/chatService.js'
import billingContextService from '../services/billingContextService.js'
import {
  resolveDateRange,
  detectIntent,
  buildRevenueQuery,
  revenueResponse,
} from '../services/chatbot/index.js'

/**
 * Controller modular para processamento de chat com intenção baseada em linguagem natural
 * Combina detecção de intenção + resolução de período com respostas formatadas
 */
export class ChatbotController {
  /**
   * Processa mensagens com inteligência de contexto
   */
  async processMessage(req, res) {
    try {
      const { message, history = [] } = req.body

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Mensagem inválida. Envie um texto não vazio.',
        })
      }

      // 1. Resolver período (hoje, ontem, semana, mês)
      const period = resolveDateRange(message)

      // 2. Detectar intenção (revenue, margin, comparison, general)
      const intent = detectIntent(message)

      // 3. Processar por intenção
      let result

      if (intent === 'revenue') {
        // Construir query de faturamento
        const revenueData = await buildRevenueQuery(period, billingContextService)

        if (!revenueData.success) {
          return res.status(500).json({
            success: false,
            error: 'Erro ao buscar dados de faturamento',
          })
        }

        // Formatar resposta
        const formattedReply = revenueResponse(revenueData.data, period)

        result = {
          success: true,
          intent,
          period,
          reply: formattedReply,
          raw: revenueData,
        }
      } else {
        // Para outras intenções, usar o chat com contexto
        result = await chatService.chat(message, history, true, period.startDate)
        result.intent = intent
        result.period = period
      }

      return res.json(result)
    } catch (error) {
      console.error('Erro em processMessage:', error)
      return res.status(500).json({
        success: false,
        error: 'Erro interno no servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }

  /**
   * Chat com suporte a multi-turno e histórico
   */
  async chat(req, res) {
    try {
      const { message, history = [], includeBillingContext = true } = req.body

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Mensagem inválida',
        })
      }

      const result = await chatService.chat(message, history, includeBillingContext)
      return res.json(result)
    } catch (error) {
      console.error('Erro no chat:', error)
      return res.status(500).json({
        success: false,
        error: 'Erro ao processar mensagem',
      })
    }
  }

  /**
   * Detecta apenas a intenção, sem processar
   */
  async analyzeIntent(req, res) {
    try {
      const { message } = req.body

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Mensagem inválida',
        })
      }

      const period = resolveDateRange(message)
      const intent = detectIntent(message)
      const isBilling = billingContextService.isBillingQuestion(message)

      return res.json({
        success: true,
        message,
        intent,
        period,
        isBillingQuestion: isBilling,
      })
    } catch (error) {
      console.error('Erro ao analisar intenção:', error)
      return res.status(500).json({
        success: false,
        error: 'Erro ao analisar intenção',
      })
    }
  }
}

export default new ChatbotController()

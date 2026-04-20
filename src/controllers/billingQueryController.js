import billingContextService from '../services/billingContextService.js'

/**
 * Controller para o endpoint /api/billing/query
 * Permite fazer queries específicas sobre faturamento
 */
export class BillingQueryController {
  async query(req, res) {
    try {
      const { question, date, type = 'resume' } = req.body

      if (!question || typeof question !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Pergunta inválida',
        })
      }

      if (!billingContextService.isBillingQuestion(question)) {
        return res.status(400).json({
          success: false,
          error: 'A pergunta não parece ser sobre faturamento',
        })
      }

      let result
      if (type === 'total') {
        result = await billingContextService.getBillingResumeTotal(date)
      } else {
        result = await billingContextService.getBillingResume(date)
      }

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || 'Erro ao buscar dados de faturamento',
        })
      }

      return res.json({
        success: true,
        question,
        date: result.date,
        type,
        count: result.count,
        data: result.data,
        formatted: result.formatted,
      })
    } catch (error) {
      console.error('Erro em query de faturamento:', error)
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao processar query de faturamento',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }

  async checkBillingQuestion(req, res) {
    try {
      const { message } = req.body

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Mensagem inválida',
        })
      }

      const isBilling = billingContextService.isBillingQuestion(message)

      return res.json({
        success: true,
        message,
        isBillingQuestion: isBilling,
      })
    } catch (error) {
      console.error('Erro ao verificar pergunta:', error)
      return res.status(500).json({
        success: false,
        error: 'Erro ao processar verificação',
      })
    }
  }
}

export default new BillingQueryController()

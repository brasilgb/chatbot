import { resolveDateRange } from "../services/chatbot/dateResolverService.js"
import { detectIntent } from "../services/chatbot/intentParserService.js"
import { buildRevenueQuery } from "../services/chatbot/queryBuilderService.js"
import { revenueResponse } from "../services/chatbot/responseFormatterService.js"
import billingContextService from "../services/billingContextService.js"

export async function chat(req, res) {
  const { message } = req.body

  const period = resolveDateRange(message)
  const intent = detectIntent(message)

  if (intent === "revenue") {
    // Extrai dados direto dos serviços (sem SQL)
    const revenueData = await buildRevenueQuery(period, billingContextService)

    if (!revenueData.success) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar dados de faturamento'
      })
    }

    const reply = revenueResponse(revenueData.data, period)

    return res.json({
      success: true,
      intent,
      period,
      reply,
      raw: revenueData
    })
  }

  res.json({ success: false, reply: "Não entendi sua solicitação." })
}

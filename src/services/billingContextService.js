import { todayYYYYMMDD, toYYYYMMDD } from '../utils/date.js'
import faturamentoTotalGeralService from './solar/faturamento/faturamentoTotalGeralService.js'
import intentParserService from './chatbot/intentParserService.js'
import responseFormatterService from './chatbot/responseFormatterService.js'
import { resolveDateRange } from './chatbot/dateResolverService.js'

async function getBillingResumeTotal(date = null) {
  try {
    const data = date ? toYYYYMMDD(date) : todayYYYYMMDD()
    const result = await faturamentoTotalGeralService.execute(data)

    return {
      success: true,
      module: 'billing',
      type: 'total',
      date: data,
      count: result.length,
      data: result,
      formatted: responseFormatterService.revenueResponse(result, { displayName: data })
    }
  } catch (error) {
    console.error('Error in getBillingResumeTotal:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function getBillingResume(date = null) {
  // Por enquanto, usamos o mesmo serviço de total geral, 
  // já que é o único implementado.
  return getBillingResumeTotal(date)
}

function isBillingQuestion(message) {
  const intent = intentParserService.detectIntent(message)
  return intent.intent === 'revenue' || intent.intent === 'margin'
}

async function createBillingContextPrompt(message, date = null) {
  if (!isBillingQuestion(message)) {
    return null
  }

  const period = resolveDateRange(message)
  const targetDate = date || period.startDate

  const result = await getBillingResumeTotal(targetDate)

  if (!result.success || !result.data || result.data.length === 0) {
    return `Você é um assistente de IA da Solar. O usuário perguntou sobre faturamento, mas não foram encontrados dados para a data ${targetDate}. Informe isso de forma educada.`
  }

  const dataStr = JSON.stringify(result.data, null, 2)

  return `Você é um assistente de IA da Solar, especializado em faturamento.
Aqui estão os dados de faturamento para a data ${targetDate}:
${dataStr}

Instruções:
1. Use os dados acima para responder à pergunta do usuário.
2. Seja preciso com os números.
3. Se a pergunta for geral, faça um breve resumo destacando o faturamento total e a meta alcançada.
4. O faturamento é o campo 'Faturamento'. A meta é 'Meta'. A porcentagem da meta alcançada é 'MetaAlcancada'.
5. Responda em português do Brasil de forma profissional.`
}

export default {
  getBillingResume,
  getBillingResumeTotal,
  isBillingQuestion,
  createBillingContextPrompt
}
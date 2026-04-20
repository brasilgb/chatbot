import dayjs from 'dayjs'
import { todayYYYYMMDD, toYYYYMMDD } from '../../utils/date.js'
import { execute as resumoFaturamento } from '../../services/solar/faturamento/resumoFaturamentoService.js'
import { execute as resumoFaturamentoTotal } from '../../services/solar/faturamento/resumoFaturamentoTotalService.js'

/**
 * Serviço para buscar dados de faturamento e formatar para o chatbot
 */
class BillingContextService {
  /**
   * Formata dados de faturamento em texto legível
   */
  formatBillingData(billingItems) {
    if (!Array.isArray(billingItems) || billingItems.length === 0) {
      return 'Nenhum dado de faturamento encontrado.'
    }

    const formatted = billingItems
      .map((item, index) => {
        const valor = item.FatuDia || item.fatuDia || item.VendaDia || item.valor || item.amount || 'N/A'
        const descricao = item.Associacao || item.associacao || item.description || item.nome || `Associação ${item.Associacao || 'N/A'}`
        const status = item.Atualizacao || item.atualizacao || item.status || 'N/A'
        const dataRaw = item.DataChave || item.dataChave || item.data || 'N/A'
        const data = this.formatBillingDate(dataRaw)
        const margem = item.MargemDia || item.margemDia || item.MargemMes || item.margemMes || 'N/A'

        return `
Faturamento ${index + 1}:
Associação: ${descricao}
Valor do Dia: R$ ${valor}
Margem: ${margem}
Última Atualização: ${status}
Data: ${data}`
      })
      .join('\n---\n')

    return formatted
  }

  formatBillingDate(dateValue) {
    const raw = String(dateValue || '').trim()
    if (/^\d{8}$/.test(raw)) {
      return `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}`
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return dayjs(raw).format('DD/MM/YYYY')
    }

    return raw || 'N/A'
  }

  /**
   * Busca resumo de faturamento para uma data
   */
  async getBillingResume(date = null) {
    try {
      const dataYYYYMMDD = date ? toYYYYMMDD(date) : todayYYYYMMDD()

      const data = await resumoFaturamento(dataYYYYMMDD)

      return {
        success: true,
        date: dataYYYYMMDD,
        count: data.length,
        data,
        formatted: this.formatBillingData(data),
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted: `Erro ao buscar dados de faturamento: ${error.message}`,
      }
    }
  }

  /**
   * Busca resumo total de faturamento para uma data
   */
  async getBillingResumeTotal(date = null) {
    try {
      const dataYYYYMMDD = date ? toYYYYMMDD(date) : todayYYYYMMDD()

      const data = await resumoFaturamentoTotal(dataYYYYMMDD)

      return {
        success: true,
        date: dataYYYYMMDD,
        count: data.length,
        data,
        formatted: this.formatBillingData(data),
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted: `Erro ao buscar dados de faturamento total: ${error.message}`,
      }
    }
  }

  /**
   * Detecta se a mensagem é sobre faturamento
   */
  isBillingQuestion(message) {
    const billingKeywords = [
      'faturamento',
      'fatura',
      'faturar',
      'faturas',
      'quanto faturou',
      'faturou',
      'receita',
      'vendas',
      'billing',
      'invoice',
      'valor faturado',
      'total faturado',
      'faturação',
    ]

    const lowerMessage = message.toLowerCase()
    return billingKeywords.some((keyword) => lowerMessage.includes(keyword))
  }

  /**
   * Cria um system prompt com contexto de faturamento
   */
  async createBillingContextPrompt(message, date = null) {
    if (!this.isBillingQuestion(message)) {
      return null
    }

    try {
      const resume = await this.getBillingResume(date)

      if (!resume.success) {
        return null
      }

      return `Você é um assistente de IA prestativo especializado em análise de dados de faturamento. 
Responda em português do Brasil, de forma clara e objetiva.

DADOS DE FATURAMENTO ATUAIS (${resume.date}):
${resume.formatted}

Quando o usuário perguntar sobre faturamento, use os dados acima para responder com precisão.
Se não tiver informações suficientes, diga claramente.`
    } catch (error) {
      console.error('Erro ao criar contexto de faturamento:', error)
      return null
    }
  }

  /**
   * Busca dados de faturamento baseado em palavras-chave na mensagem
   */
  async enrichMessageWithBillingData(message, date = null) {
    if (!this.isBillingQuestion(message)) {
      return { hasBillingData: false, data: null }
    }

    try {
      // Detectar se é pergunta sobre total
      const isTotalQuestion =
        message.toLowerCase().includes('total') ||
        message.toLowerCase().includes('resumo')

      const result = isTotalQuestion
        ? await this.getBillingResumeTotal(date)
        : await this.getBillingResume(date)

      return {
        hasBillingData: result.success,
        data: result,
      }
    } catch (error) {
      return { hasBillingData: false, data: null, error: error.message }
    }
  }
}

export default new BillingContextService()

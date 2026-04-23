import dayjs from 'dayjs'
import { todayYYYYMMDD, toYYYYMMDD } from '../utils/date.js'
import { execute as resumoFaturamento } from './solar/faturamento/resumoFaturamentoService.js'
import { execute as resumoFaturamentoTotal } from './solar/faturamento/resumoFaturamentoTotalService.js'

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

    if (billingItems.length > 1) {
      return this.formatBillingTable(billingItems)
    }

    const formatted = billingItems
      .map((item, index) => {
        const fields = Object.entries(item)
          .map(([key, value]) => `${key}: ${this.formatBillingValue(key, value)}`)
          .join('\n')

        return `
Registro ${index + 1}:
${fields}`
      })
      .join('\n---\n')

    return formatted
  }

  formatBillingTable(billingItems) {
    const columns = Array.from(
      billingItems.reduce((set, item) => {
        Object.keys(item || {}).forEach((key) => set.add(key))
        return set
      }, new Set())
    )
    const header = `| ${columns.join(' | ')} |`
    const separator = `| ${columns.map(() => '---').join(' | ')} |`
    const rows = billingItems.map((item) => {
      const values = columns.map((column) => {
        const value = this.formatBillingValue(column, item[column])
        return this.escapeTableValue(value)
      })

      return `| ${values.join(' | ')} |`
    })

    return [header, separator, ...rows].join('\n')
  }

  escapeTableValue(value) {
    return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
  }

  formatBillingValue(key, value) {
    if (value === null || value === undefined || value === '') {
      return 'N/A'
    }

    if (/data/i.test(key)) {
      return this.formatBillingDate(value)
    }

    return String(value)
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

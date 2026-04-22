import billingContextService from './billingContextService.js'

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
const MODEL = process.env.MODEL || 'gemma3:4b'

export class ChatService {
  async checkHealth() {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`)
      if (!response.ok) {
        return {
          ok: false,
          ollama: false,
          error: 'Ollama não está respondendo',
        }
      }

      const data = await response.json()
      return {
        ok: true,
        ollama: true,
        models: data.models ?? [],
      }
    } catch (error) {
      return {
        ok: false,
        ollama: false,
        error: error.message,
      }
    }
  }

  /**
   * Monta o system prompt com contexto de faturamento se relevante
   */
  async getSystemPrompt(message, includeBillingContext = false, date = null) {
    let systemPrompt =
      process.env.SYSTEM_PROMPT ||
      'Você é um assistente de IA prestativo. Responda em português do Brasil, de forma clara e objetiva. Seja conciso e direto nas respostas.'

    if (includeBillingContext) {
      const billingContextPrompt =
        await billingContextService.createBillingContextPrompt(message, date)
      if (billingContextPrompt) {
        systemPrompt = billingContextPrompt
      }
    }

    return systemPrompt
  }

  async chat(message, history = [], includeBillingContext = true, date = null) {
    console.log('Chat service called with message:', message)
    if (!message || typeof message !== 'string') {
      throw new Error('Mensagem inválida')
    }

    // Resposta temporária (Mock)
    return {
      success: true,
      reply: 'Olá! Como posso ajudar você hoje?',
      model: MODEL,
      hasBillingData: false,
      billingData: null,
      raw: { test: true },
    }
  } // <--- AQUI FALTAVA ESSA CHAVE!

  async streamChat(message, history = [], includeBillingContext = true, date = null) {
    if (!message || typeof message !== 'string') {
      throw new Error('Mensagem inválida')
    }

    const systemPrompt = await this.getSystemPrompt(message, includeBillingContext, date)

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...history,
      {
        role: 'user',
        content: message,
      },
    ]

    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: true,
      }),
    })

    if (!ollamaResponse.ok) {
      throw new Error('Ollama não está respondendo')
    }

    return ollamaResponse.body
  }
}

export default new ChatService()
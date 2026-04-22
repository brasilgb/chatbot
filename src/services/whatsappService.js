const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v20.0'
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN
const WHATSAPP_GRAPH_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`
const WHATSAPP_TEXT_LIMIT = 4096

export class WhatsAppService {
  verifyWebhook(query) {
    const mode = query['hub.mode']
    const token = query['hub.verify_token']
    const challenge = query['hub.challenge']

    if (
      WHATSAPP_VERIFY_TOKEN &&
      mode === 'subscribe' &&
      token === WHATSAPP_VERIFY_TOKEN
    ) {
      return { verified: true, challenge }
    }

    return { verified: false }
  }

  extractTextMessages(body) {
    const messages = []

    for (const entry of body?.entry ?? []) {
      for (const change of entry?.changes ?? []) {
        const value = change?.value
        const phoneNumberId = value?.metadata?.phone_number_id

        for (const message of value?.messages ?? []) {
          messages.push({
            id: message.id,
            from: message.from,
            type: message.type,
            text: message.text?.body ?? null,
            timestamp: message.timestamp,
            phoneNumberId,
          })
        }
      }
    }

    return messages
  }

  async sendTextMessage(to, text, phoneNumberId = WHATSAPP_PHONE_NUMBER_ID) {
    if (!WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WHATSAPP_ACCESS_TOKEN não configurado')
    }

    if (!phoneNumberId) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID não configurado')
    }

    const chunks = this.splitText(text)
    const responses = []

    for (const chunk of chunks) {
      const response = await fetch(
        `${WHATSAPP_GRAPH_URL}/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: {
              preview_url: false,
              body: chunk,
            },
          }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data?.error?.message || 'Erro ao enviar mensagem pelo WhatsApp'
        )
      }

      responses.push(data)
    }

    return responses
  }

  splitText(text) {
    const normalized =
      String(text || '').trim() || 'Não consegui gerar uma resposta.'

    if (normalized.length <= WHATSAPP_TEXT_LIMIT) {
      return [normalized]
    }

    const chunks = []
    for (
      let index = 0;
      index < normalized.length;
      index += WHATSAPP_TEXT_LIMIT
    ) {
      chunks.push(normalized.slice(index, index + WHATSAPP_TEXT_LIMIT))
    }

    return chunks
  }
}

export default new WhatsAppService()

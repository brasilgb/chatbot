import chatService from '../services/chatService.js'
import whatsappService from '../services/whatsappService.js'

export class WhatsAppController {
  verify(req, res) {
    const result = whatsappService.verifyWebhook(req.query)

    if (!result.verified) {
      return res.sendStatus(403)
    }

    return res.status(200).send(result.challenge)
  }

  async webhook(req, res) {
    const messages = whatsappService.extractTextMessages(req.body)
    const results = []

    for (const message of messages) {
      try {
        if (message.type !== 'text' || !message.text) {
          await whatsappService.sendTextMessage(
            message.from,
            'No momento eu consigo responder apenas mensagens de texto.',
            message.phoneNumberId
          )

          results.push({ id: message.id, status: 'unsupported' })
          continue
        }

        const chatResult = await chatService.chat(message.text, [], true)

        await whatsappService.sendTextMessage(
          message.from,
          chatResult.reply,
          message.phoneNumberId
        )

        results.push({ id: message.id, status: 'sent' })
      } catch (error) {
        console.error('Erro ao processar mensagem do WhatsApp:', error)
        results.push({
          id: message.id,
          status: 'error',
          error: error.message,
        })
      }
    }

    return res.status(200).json({
      success: true,
      received: messages.length,
      results: process.env.NODE_ENV === 'development' ? results : undefined,
    })
  }
}

export default new WhatsAppController()

/**
 * Utilitários para o serviço de chat
 */

export function formatMessageForOllama(message) {
  return message.trim()
}

export function extractReplyFromOllamaResponse(response) {
  return response?.message?.content || ''
}

export function buildChatHistory(messages) {
  return messages.map((msg) => ({
    role: msg.role || 'user',
    content: msg.content || '',
  }))
}

export function validateMessage(message) {
  if (!message) return { valid: false, error: 'Mensagem vazia' }
  if (typeof message !== 'string') return { valid: false, error: 'Mensagem não é texto' }
  if (message.trim().length === 0) return { valid: false, error: 'Mensagem vazia' }
  if (message.length > 10000) return { valid: false, error: 'Mensagem muito longa (máximo 10000 caracteres)' }

  return { valid: true }
}

export function validateHistory(history) {
  if (!Array.isArray(history)) return false

  return history.every(
    (msg) =>
      msg &&
      typeof msg === 'object' &&
      typeof msg.role === 'string' &&
      typeof msg.content === 'string'
  )
}

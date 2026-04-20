import express from 'express'
import chatbotController from '../controllers/chatbotController.js'

const router = express.Router()

/**
 * POST /api/chatbot/process
 * Processa mensagens com detecção automática de intenção
 * Body: { message: string, history?: array }
 */
router.post('/process', (req, res) => chatbotController.processMessage(req, res))

/**
 * POST /api/chatbot/chat
 * Chat simples com suporte a histórico
 * Body: { message: string, history?: array, includeBillingContext?: boolean }
 */
router.post('/chat', (req, res) => chatbotController.chat(req, res))

/**
 * POST /api/chatbot/analyze-intent
 * Apenas analisa intenção sem processar
 * Body: { message: string }
 */
router.post('/analyze-intent', (req, res) =>
  chatbotController.analyzeIntent(req, res)
)

export default router

import express from 'express'
import chatController from '../controllers/chatController.js'

const router = express.Router()

/**
 * GET /api/chat/health
 * Verifica a saúde da API e a conexão com Ollama
 */
router.get('/health', (req, res) => chatController.health(req, res))

/**
 * GET /api/chat/test
 * Endpoint de teste simples
 */
router.get('/test', (req, res) => chatController.test(req, res))

/**
 * POST /api/chat
 * Envia uma mensagem e recebe a resposta
 * Body:
 *   - message: string (obrigatório)
 *   - history: array (opcional) - histórico de mensagens anteriores
 */
router.post('/', (req, res) => chatController.chat(req, res))

/**
 * POST /api/chat/stream
 * Envia uma mensagem e recebe a resposta em tempo real (Server-Sent Events)
 * Body:
 *   - message: string (obrigatório)
 *   - history: array (opcional)
 */
router.post('/stream', (req, res) => chatController.streamChat(req, res))

export default router

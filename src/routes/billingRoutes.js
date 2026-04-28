import express from 'express'
import billingQueryController from '../controllers/billingQueryController.js'

import {faturamentoTotalGeral} from '../controllers/solar/total-geral/faturamentoTotalGeralController.js'

const router = express.Router()

/**
 * GET /api/billing/resumo-faturamento-total?data=YYYY-MM-DD
 * Busca resumo total de faturamento para uma data específica
 */
router.get('/faturamento-total-geral', faturamentoTotalGeral)

/**
 * POST /api/billing/query
 * Faz uma query sobre faturamento
 * Body:
 *   - question: string (obrigatório)
 *   - date: string (opcional) - data no formato YYYY-MM-DD
 *   - type: string (opcional) - 'resume' ou 'total'
 */
router.post('/query', (req, res) => billingQueryController.query(req, res))

/**
 * POST /api/billing/check-question
 * Verifica se uma mensagem é uma pergunta sobre faturamento
 * Body:
 *   - message: string (obrigatório)
 */
router.post('/check-question', (req, res) =>
  billingQueryController.checkBillingQuestion(req, res)
)

export default router

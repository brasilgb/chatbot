import express from 'express'
import { resumoFaturamento, resumoFaturamentoTotal } from '../controllers/solar/faturamento/resumoFaturamentoController.js'

const router = express.Router()

router.get('/resumo-faturamento', resumoFaturamento)
router.get('/resumo-faturamento-total', resumoFaturamentoTotal)

export default router
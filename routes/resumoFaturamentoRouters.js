const express = require('express');
const resumoFaturamentoController = require('../controllers/solar/faturamento/resumoFaturamentoController');

const router = express.Router();

router.get('/resumo-faturamento', resumoFaturamentoController.resumoFaturamento);
router.get('/resumo-faturamento-total', resumoFaturamentoController.resumoFaturamentoTotal);

module.exports = router;
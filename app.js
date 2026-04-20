const express = require('express');
const resumoFaturamentoRoutes = require('./routes/resumoFaturamentoRouters');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  return res.json({ ok: true });
});

app.use('/api/loj-resumo-faturamento', resumoFaturamentoRoutes);

module.exports = app;
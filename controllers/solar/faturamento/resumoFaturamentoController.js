const resumoFaturamentoService = require('../../../services/solar/faturamento/resumoFaturamentoService');
const resumoFaturamentoTotalService = require('../../../services/solar/faturamento/resumoFaturamentoTotalService');
const { toYYYYMMDD, todayYYYYMMDD } = require('../../../utils/date');

async function resumoFaturamento(req, res) {
  try {
    const data = req.query.data
      ? toYYYYMMDD(req.query.data)
      : todayYYYYMMDD();

    const results = await resumoFaturamentoService.execute(data);

    return res.json({
      success: true,
      data,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error('Erro em lojFatFatura:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar LOJ_FAT_FATURA',
      error: error.message,
    });
  }
}

async function resumoFaturamentoTotal(req, res) {
  try {
    const data = req.query.data
      ? toYYYYMMDD(req.query.data)
      : todayYYYYMMDD();

    const results = await resumoFaturamentoTotalService.execute(data);

    return res.json({
      success: true,
      data,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error('Erro em lojFatFatuto:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar LOJ_FAT_FATUTO',
      error: error.message,
    });
  }
}

module.exports = {
  resumoFaturamento,
  resumoFaturamentoTotal,
};
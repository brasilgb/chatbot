import resumoFaturamentoService from '../../../services/solar/faturamento/resumoFaturamentoService.js'
import resumoFaturamentoTotalService from '../../../services/solar/faturamento/resumoFaturamentoTotalService.js'
import { toYYYYMMDD, todayYYYYMMDD } from '../../../utils/date.js'

async function resumoFaturamento(req, res) {
  try {
    const data = req.query.data
      ? toYYYYMMDD(req.query.data)
      : todayYYYYMMDD()

    const results = await resumoFaturamentoService.execute(data)

    return res.json({
      success: true,
      data,
      total: results.length,
      results,
    })
  } catch (error) {
    console.error('Erro em resumoFaturamento:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar resumo de faturamento',
      error: error.message,
    })
  }
}

async function resumoFaturamentoTotal(req, res) {
  try {
    const data = req.query.data
      ? toYYYYMMDD(req.query.data)
      : todayYYYYMMDD()

    const results = await resumoFaturamentoTotalService.execute(data)

    return res.json({
      success: true,
      data,
      total: results.length,
      results,
    })
  } catch (error) {
    console.error('Erro em resumoFaturamentoTotal:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar resumo total de faturamento',
      error: error.message,
    })
  }
}

export { resumoFaturamento, resumoFaturamentoTotal }
export default { resumoFaturamento, resumoFaturamentoTotal }
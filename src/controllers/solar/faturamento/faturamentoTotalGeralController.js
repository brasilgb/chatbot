import faturamentoTotalGeralService from '../../../services/solar/faturamento/faturamentoTotalGeralService.js'
import { toYYYYMMDD, todayYYYYMMDD } from '../../../utils/date.js'

async function faturamentoTotalGeral(req, res) {
  try {
    const data = req.query.data
      ? toYYYYMMDD(req.query.data)
      : todayYYYYMMDD()

    const results = await faturamentoTotalGeralService.execute(data)

    return res.json({
      success: true,
      empresa: 'solar',
      modulo: 'faturamento',
      tipo: 'total-geral',
      data,
      total: results.length,
      results,
    })
  } catch (error) {
    console.error('Erro em faturamentoTotalGeral:', error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar faturamento total geral',
      error: error.message,
    })
  }
}

export { faturamentoTotalGeral }

export default {
  faturamentoTotalGeral,
}
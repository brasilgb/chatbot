import { todayYYYYMMDD, toYYYYMMDD } from '../utils/date.js'
import { execute as resumoFaturamento } from './solar/faturamento/resumoFaturamentoService.js'
import { execute as resumoFaturamentoTotal } from './solar/faturamento/resumoFaturamentoTotalService.js'
import { formatBillingData } from './billingFormatter.js'

async function getResume(date = null) {
  const data = date ? toYYYYMMDD(date) : todayYYYYMMDD()

  const result = await resumoFaturamento(data)

  return {
    success: true,
    module: 'billing',
    type: 'resume',
    date: data,
    count: result.length,
    data: result,
    formatted: formatBillingData(result)
  }
}

async function getResumeTotal(date = null) {
  const data = date ? toYYYYMMDD(date) : todayYYYYMMDD()

  const result = await resumoFaturamentoTotal(data)

  return {
    success: true,
    module: 'billing',
    type: 'total',
    date: data,
    count: result.length,
    data: result,
    formatted: formatBillingData(result)
  }
}

export default {
  getResume,
  getResumeTotal
}
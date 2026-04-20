import { toYYYYMMDD } from '../../../utils/date.js'

export async function buildRevenueQuery(period, billingContextService) {
  if (!period) return null

  const dataYYYYMMDD = toYYYYMMDD(period.startDate)

  if (period.type === 'week' || period.type === 'month') {
    const result = await billingContextService.getBillingResumeTotal(dataYYYYMMDD)
    return {
      success: result.success,
      data: result.data || [],
      formatted: result.formatted,
      period,
    }
  }

  const result = await billingContextService.getBillingResume(dataYYYYMMDD)
  return {
    success: result.success,
    data: result.data || [],
    formatted: result.formatted,
    period,
  }
}

export default { buildRevenueQuery }

import { toYYYYMMDD } from '../../utils/date.js'

export async function buildRevenueQuery(period, billingContextService, options = {}) {
  if (!period) return null

  const dataYYYYMMDD = toYYYYMMDD(period.startDate)
  const message = options.message || ''
  const hasAssociationIntent = isAssociationQuestion(message)
  const useTotalQuery =
    !hasAssociationIntent &&
    (options.total === true || isTotalRevenueQuestion(message))

  if (useTotalQuery || period.type === 'week' || period.type === 'month') {
    const result = await billingContextService.getBillingResumeTotal(dataYYYYMMDD)
    return {
      success: result.success,
      data: result.data || [],
      formatted: result.formatted,
      period,
      queryType: 'total',
    }
  }

  const result = await billingContextService.getBillingResume(dataYYYYMMDD)
  const data = filterByAssociation(result.data || [], message)

  return {
    success: result.success,
    data,
    formatted: result.formatted,
    period,
    queryType: data.length === 1 ? 'association' : 'detail',
  }
}

function isTotalRevenueQuestion(message = '') {
  const lowerMessage = String(message).toLowerCase()
  const totalKeywords = [
    'total',
    'geral',
    'consolidado',
    'consolidada',
    'resumo',
    'meta',
    'atingido',
    'performance',
  ]

  return totalKeywords.some((keyword) => lowerMessage.includes(keyword))
}

function isAssociationQuestion(message = '') {
  const lowerMessage = String(message).toLowerCase()
  return lowerMessage.includes('associação') || lowerMessage.includes('associacao')
}

function filterByAssociation(data, message = '') {
  if (!Array.isArray(data) || data.length === 0 || !isAssociationQuestion(message)) {
    return data
  }

  const requestedAssociation = findRequestedAssociation(data, message)
  if (!requestedAssociation) {
    return data
  }

  return data.filter((item) =>
    normalizeText(item?.Associacao) === requestedAssociation
  )
}

function findRequestedAssociation(data, message) {
  const normalizedMessage = normalizeText(message)
  const associations = data
    .map((item) => normalizeText(item?.Associacao))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)

  return associations.find((association) =>
    new RegExp(`(^|\\s)${escapeRegExp(association)}($|\\s)`).test(normalizedMessage)
  )
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default { buildRevenueQuery }

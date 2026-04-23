export function revenueResponse(data, period) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return `Não encontrei dados de faturamento para ${period.displayName}.`
  }

  const total = data.reduce((sum, item) => sum + parseLocaleNumber(getField(item, [
    'FatuDia',
    'VendaDia',
    'ValorDia',
    'Valor',
  ])), 0)
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const columns = getColumns(data)

  let response = `Faturamento de ${period.displayName}:
Total de registros: ${data.length}
Total Geral: R$ ${formatter.format(total)}

Detalhado por registro:\n`

  data.forEach((item, index) => {
    const values = columns
      .map((column) => `${column}: ${formatValue(item[column])}`)
      .join(' | ')
    response += `${index + 1}. ${values}\n`
  })

  return response
}

function getColumns(data) {
  const preferredColumns = [
    'Associacao',
    'DataChave',
    'FatuDia',
    'FatuMes',
    'VendaDia',
    'VendaMes',
    'MargemDia',
    'MargemMes',
    'Atualizacao',
  ]
  const allColumns = Array.from(
    data.reduce((columns, item) => {
      Object.keys(item || {}).forEach((key) => columns.add(key))
      return columns
    }, new Set())
  )

  return [
    ...preferredColumns.filter((column) => allColumns.includes(column)),
    ...allColumns.filter((column) => !preferredColumns.includes(column)),
  ]
}

function getField(item, fields) {
  for (const field of fields) {
    if (item?.[field] !== undefined && item[field] !== null && item[field] !== '') {
      return item[field]
    }
  }

  return 0
}

function parseLocaleNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const raw = String(value || '').trim()
  if (!raw) {
    return 0
  }

  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  return String(value)
}

export default { revenueResponse }

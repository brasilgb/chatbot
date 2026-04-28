export function revenueResponse(data, period) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return `Não encontrei dados de faturamento para ${period.displayName}.`
  }

  const total = data.reduce((sum, item) => sum + parseLocaleNumber(getField(item, [
    'Faturamento',
    'FatuDia',
    'VendaDia',
    'ValorDia',
    'Valor',
  ])), 0)

  let response = `Faturamento de ${period.displayName}:
Total de registros: ${data.length}
Total Geral: ${formatCurrency(total)}
${formatRecords(data)}`

  return response
}

function formatRecords(data) {
  if (data.length > 1) {
    return data
      .map((item) => {
        const associacao = getField(item, ['Associacao', 'Departamento', 'associacao', 'nome'])
        const valor = getField(item, ['Faturamento', 'FatuDia', 'VendaDia', 'ValorDia', 'Valor'])
        return `${associacao}: ${formatCurrency(valor)}`
      })
      .join('\n')
  }

  const columns = getColumns(data)
  return columns
    .map((column) => `${column}: ${formatValue(column, data[0]?.[column])}`)
    .join('\n')
}

function getColumns(data) {
  const preferredColumns = [
    'Associacao',
    'Departamento',
    'DataChave',
    'Faturamento',
    'Meta',
    'MetaAlcancada',
    'Margem',
    'Projecao',
    'FatuDia',
    'VendaDia',
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

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  if (isCurrencyField(key)) {
    return formatCurrency(value)
  }

  if (isPercentField(key)) {
    return formatPercent(value)
  }

  return String(value)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseLocaleNumber(value)).replace(/\u00a0/g, ' ')
}

function formatPercent(value) {
  const number = parseLocaleNumber(value)
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)
}

function isCurrencyField(key) {
  return /(fatu|venda|valor|meta|falta|juros|media)/i.test(key)
}

function isPercentField(key) {
  return /(margem|rep|perf|atingido|parc)/i.test(key)
}

export default { revenueResponse }

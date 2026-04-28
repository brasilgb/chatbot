const FIELD_CONFIG = {
  Meta: { label: 'Valor da meta', type: 'currency' },
  Faturamento: { label: 'Faturamento', type: 'currency' },
  Projecao: { label: 'Projeção', type: 'percent' },
  Margem: { label: 'Margem', type: 'percent' },
  PrecoMedio: { label: 'Preço médio', type: 'currency' },
  TicketMedio: { label: 'Ticket Médio', type: 'currency' },
  MetaAlcancada: { label: 'Meta alcançada', type: 'percent' },
  FaturamentoSemBrasil: { label: 'Faturamento Sem Brasil', type: 'currency' },
  MargemSemBrasil: { label: 'Margem Sem Brasil', type: 'percent' },
  PrecoMedioSemBrasil: { label: 'Preço Médio Sem Brasil', type: 'currency' },
  VendaAgora: { label: 'Venda agora mes', type: 'currency' },
  VendaDia: { label: 'venda agora dia', type: 'currency' },
  MargemMediaAno: { label: 'margem media ano', type: 'percent' },
  JurosMedioAno: { label: 'juros medio ano', type: 'percent' },
  Juros: { label: 'Juros', type: 'percent' },
  JuroAgora: { label: 'Juros agora ou hoje', type: 'currency' },
  DataChave: { label: 'Data', type: 'date' },
  Atualizacao: { label: 'Última Atualização', type: 'string' },
}

export function revenueResponse(data, period) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return `Não encontrei dados de faturamento para ${period.displayName}.`
  }

  const total = data.reduce(
    (sum, item) =>
      sum +
      parseLocaleNumber(
        getField(item, ['Faturamento', 'FatuDia', 'VendaDia', 'ValorDia', 'Valor'])
      ),
    0
  )

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
    .map((column) => {
      const config = FIELD_CONFIG[column]
      const label = config ? config.label : column
      return `${label}: ${formatValue(column, data[0]?.[column])}`
    })
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

  const config = FIELD_CONFIG[key]
  const type = config ? config.type : null

  if (type === 'currency' || (type === null && isCurrencyField(key))) {
    return formatCurrency(value)
  }

  if (type === 'percent' || (type === null && isPercentField(key))) {
    return formatPercent(value)
  }

  if (type === 'date') {
    return formatDate(value)
  }

  return String(value)
}

function formatDate(value) {
  const str = String(value)
  if (str.length === 8) {
    // YYYYMMDD
    return `${str.substring(6, 8)}/${str.substring(4, 6)}/${str.substring(0, 4)}`
  }
  return str
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
  // Evita campos que sabemos que são porcentagens
  if (isPercentField(key)) return false
  return /(fatu|venda|valor|meta|falta|juro|media)/i.test(key)
}

function isPercentField(key) {
  return /(margem|rep|perf|atingido|parc|alcancada|projecao)/i.test(key)
}

export default { revenueResponse }

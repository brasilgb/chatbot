export function revenueResponse(data, period) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return `Não encontrei dados de faturamento para ${period.displayName}.`
  }

  if (data.length === 1) {
    const item = data[0]
    const fatuDia = item.FatuDia || item.VendaDia || 0
    const fatuMes = item.FatuMes || item.VendaMes || 0
    const margem = item.MargemDia || item.MargemMes || 0

    const formatter = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return `Faturamento de ${period.displayName}:
• Valor do Dia: R$ ${formatter.format(parseFloat(fatuDia))}
• Valor do Mês: R$ ${formatter.format(parseFloat(fatuMes))}
• Margem: ${formatter.format(parseFloat(margem))}%`
  }

  const total = data.reduce((sum, item) => sum + (parseFloat(item.FatuDia) || 0), 0)
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  let response = `Faturamento de ${period.displayName}:
Total Geral: R$ ${formatter.format(total)}

Detalhado por Associação:\n`

  data.forEach((item, index) => {
    response += `  ${index + 1}. ${item.Associacao}: R$ ${formatter.format(parseFloat(item.FatuDia || 0))} (Margem: ${formatter.format(parseFloat(item.MargemDia || 0))}%)\n`
  })

  return response
}

export default { revenueResponse }

export function detectIntent(message) {
  const lowerMessage = message.toLowerCase()

  const revenueKeywords = [
    'faturamento', 'fatura', 'receita', 'vendas', 'billing', 'invoice',
    'valor faturado', 'total faturado', 'venda'
  ]

  if (revenueKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return 'revenue'
  }

  const marginKeywords = ['margem', 'lucro', 'lucratividade', 'rentabilidade']
  if (marginKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return 'margin'
  }

  const comparisonKeywords = ['comparado', 'versus', 'vs', 'diferença', 'crescimento']
  if (comparisonKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return 'comparison'
  }

  return 'general'
}

export default { detectIntent }

// src/chatbot/intentParserService.js

const INTENTS = {
  revenue: {
    keywords: [
      'faturamento',
      'fatura',
      'receita',
      'vendas',
      'venda',
      'valor faturado',
      'total faturado',
      'billing',
      'invoice',
    ],
    priority: 3,
  },

  margin: {
    keywords: [
      'margem',
      'lucro',
      'lucratividade',
      'rentabilidade',
    ],
    priority: 3,
  },

  comparison: {
    keywords: [
      'comparado',
      'comparar',
      'comparação',
      'versus',
      'diferença',
      'crescimento',
      'queda',
      'aumento',
      'evolução',
    ],
    priority: 4,
  },

  ranking: {
    keywords: [
      'ranking',
      'top',
      'maiores',
      'menores',
      'melhores',
      'piores',
    ],
    priority: 4,
  },

  general: {
    keywords: [],
    priority: 0,
  },
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function findKeywordMatches(message, keywords) {
  const normalizedMessage = normalizeText(message)

  return keywords.filter((keyword) => {
    const normalizedKeyword = normalizeText(keyword)

    const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i')

    return regex.test(normalizedMessage)
  })
}

export function detectIntent(message) {
  if (!message || typeof message !== 'string') {
    return {
      intent: 'general',
      confidence: 0,
      keywordsFound: [],
    }
  }

  const results = Object.entries(INTENTS)
    .filter(([intent]) => intent !== 'general')
    .map(([intent, config]) => {
      const keywordsFound = findKeywordMatches(message, config.keywords)

      const score = keywordsFound.length * config.priority

      return {
        intent,
        score,
        keywordsFound,
      }
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)

  if (!results.length) {
    return {
      intent: 'general',
      confidence: 0.3,
      keywordsFound: [],
    }
  }

  const bestResult = results[0]

  return {
    intent: bestResult.intent,
    confidence: Math.min(bestResult.score / 10, 1),
    keywordsFound: bestResult.keywordsFound,
    alternatives: results.slice(1),
  }
}

export default {
  detectIntent,
}
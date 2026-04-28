import dayjs from 'dayjs'

export function resolveDateRange(message) {
  const lowerMessage = message.toLowerCase().trim()

  // Regex para capturar DD/MM/YYYY ou DD/MM
  const dateRegex = /(\d{1,2})\/(\d{1,2})(\/(\d{2,4}))?/
  const match = lowerMessage.match(dateRegex)

  if (match) {
    const day = match[1].padStart(2, '0')
    const month = match[2].padStart(2, '0')
    const year = match[4] ? (match[4].length === 2 ? `20${match[4]}` : match[4]) : dayjs().year()
    
    const dateStr = `${year}-${month}-${day}`
    const parsed = dayjs(dateStr)

    if (parsed.isValid()) {
      return {
        type: 'day',
        startDate: parsed.format('YYYY-MM-DD'),
        endDate: parsed.format('YYYY-MM-DD'),
        displayName: parsed.format('DD/MM/YYYY'),
      }
    }
  }

  if (lowerMessage.includes('hoje') || lowerMessage.includes('agora')) {
    return {
      type: 'day',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
      displayName: 'hoje',
    }
  }

  if (lowerMessage.includes('anteontem')) {
    return {
      type: 'day',
      startDate: dayjs().subtract(2, 'days').format('YYYY-MM-DD'),
      endDate: dayjs().subtract(2, 'days').format('YYYY-MM-DD'),
      displayName: 'anteontem',
    }
  }

  if (lowerMessage.includes('ontem')) {
    return {
      type: 'day',
      startDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      displayName: 'ontem',
    }
  }

  if (lowerMessage.includes('semana passada') || lowerMessage.includes('semana anterior')) {
    const lastWeek = dayjs().subtract(1, 'week')
    return {
      type: 'week',
      startDate: lastWeek.startOf('week').format('YYYY-MM-DD'),
      endDate: lastWeek.endOf('week').format('YYYY-MM-DD'),
      displayName: 'semana passada',
    }
  }

  if (lowerMessage.includes('semana')) {
    return {
      type: 'week',
      startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
      displayName: 'esta semana',
    }
  }

  if (lowerMessage.includes('mês passado') || lowerMessage.includes('mes passado') || lowerMessage.includes('mês anterior') || lowerMessage.includes('mes anterior')) {
    const lastMonth = dayjs().subtract(1, 'month')
    return {
      type: 'month',
      startDate: lastMonth.endOf('month').format('YYYY-MM-DD'), // Usamos o último dia para pegar o acumulado
      endDate: lastMonth.endOf('month').format('YYYY-MM-DD'),
      displayName: 'mês passado',
    }
  }

  if (lowerMessage.includes('mês') || lowerMessage.includes('mes')) {
    return {
      type: 'month',
      startDate: dayjs().format('YYYY-MM-DD'), // Para o mês atual, usamos hoje para pegar o acumulado até agora
      endDate: dayjs().format('YYYY-MM-DD'),
      displayName: 'este mês',
    }
  }

  return {
    type: 'day',
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    displayName: 'hoje',
  }
}

export default { resolveDateRange }

import dayjs from 'dayjs'

export function resolveDateRange(message) {
  const lowerMessage = message.toLowerCase().trim()

  if (lowerMessage.includes('hoje') || lowerMessage.includes('agora')) {
    return {
      type: 'day',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
      displayName: 'hoje',
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

  if (lowerMessage.includes('semana')) {
    return {
      type: 'week',
      startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
      displayName: 'esta semana',
    }
  }

  if (lowerMessage.includes('mês')) {
    return {
      type: 'month',
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
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

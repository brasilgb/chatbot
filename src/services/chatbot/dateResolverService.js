import dayjs from 'dayjs'

export function resolveDateRange(message) {
  const lowerMessage = message.toLowerCase().trim()

  if (lowerMessage.includes('hoje') || lowerMessage.includes('agora')) {
    return {
      type: 'day',
      startDate: dayjs().format('YYYYMMDD'),
      endDate: dayjs().format('YYYYMMDD'),
      displayName: 'hoje',
    }
  }

  if (lowerMessage.includes('ontem')) {
    return {
      type: 'day',
      startDate: dayjs().subtract(1, 'day').format('YYYYMMDD'),
      endDate: dayjs().subtract(1, 'day').format('YYYYMMDD'),
      displayName: 'ontem',
    }
  }

  if (lowerMessage.includes('semana')) {
    return {
      type: 'week',
      startDate: dayjs().startOf('week').format('YYYYMMDD'),
      endDate: dayjs().format('YYYYMMDD'),
      displayName: 'esta semana',
    }
  }

  if (lowerMessage.includes('mês')) {
    return {
      type: 'month',
      startDate: dayjs().startOf('month').format('YYYYMMDD'),
      endDate: dayjs().format('YYYYMMDD'),
      displayName: 'este mês',
    }
  }

  return {
    type: 'day',
    startDate: dayjs().format('YYYYMMDD'),
    endDate: dayjs().format('YYYYMMDD'),
    displayName: 'hoje',
  }
}

export default { resolveDateRange }

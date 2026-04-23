import dayjs from 'dayjs'

function toYYYYMMDD(dateValue) {
  if (!dateValue) {
    return todayYYYYMMDD()
  }

  const raw = String(dateValue).trim()

  if (/^\d{8}$/.test(raw)) {
    return raw
  }

  const parsedDate = dayjs(raw)

  if (!parsedDate.isValid()) {
    throw new Error(`Data inválida: ${raw}`)
  }

  return parsedDate.format('YYYYMMDD')
}

function todayYYYYMMDD() {
  return dayjs().format('YYYYMMDD')
}

export { toYYYYMMDD, todayYYYYMMDD }
export default { toYYYYMMDD, todayYYYYMMDD }

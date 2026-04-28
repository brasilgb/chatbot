import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

dayjs.extend(customParseFormat)

function toYYYYMMDD(dateValue) {
  if (!dateValue) {
    return todayYYYYMMDD()
  }

  const raw = String(dateValue).trim()

  if (/^\d{8}$/.test(raw)) {
    return raw
  }

  // Tenta converter de DD/MM/YYYY para objeto dayjs primeiro
  let parsedDate = dayjs(raw, 'DD/MM/YYYY', true)

  if (!parsedDate.isValid()) {
    parsedDate = dayjs(raw)
  }

  if (!parsedDate.isValid()) {
    throw new Error(`Data inválida: ${raw}`)
  }

  return parsedDate.format('YYYYMMDD')
}

function isYYYYMMDD(dateValue) {
  return /^\d{8}$/.test(String(dateValue || '').trim())
}

function todayYYYYMMDD() {
  return dayjs().format('YYYYMMDD')
}

export { isYYYYMMDD, toYYYYMMDD, todayYYYYMMDD }
export default { isYYYYMMDD, toYYYYMMDD, todayYYYYMMDD }

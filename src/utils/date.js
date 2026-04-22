import dayjs from 'dayjs'

function toYYYYMMDD(dateValue) {
  return dayjs(dateValue).format('YYYYMMDD')
}

function todayYYYYMMDD() {
  return dayjs().format('YYYYMMDD')
}

export { toYYYYMMDD, todayYYYYMMDD }
export default { toYYYYMMDD, todayYYYYMMDD }

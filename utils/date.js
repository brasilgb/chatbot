const dayjs = require('dayjs');

function toYYYYMMDD(dateValue) {
  return dayjs(dateValue).format('YYYYMMDD');
}

function todayYYYYMMDD() {
  return dayjs().format('YYYYMMDD');
}

module.exports = {
  toYYYYMMDD,
  todayYYYYMMDD,
};
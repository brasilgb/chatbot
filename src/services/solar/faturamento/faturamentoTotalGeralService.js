import { postComSessao } from '../../../config/birelClient.js'
import { toYYYYMMDD } from '../../../utils/date.js'
import { normalizeBidata } from '../responseUtils.js'

async function execute(data) {
  const dataYYYYMMDD = toYYYYMMDD(data)

  const response = await postComSessao('(LOJ_FATU_TOTAL)', {
    datalojfatutotal: dataYYYYMMDD,
  })

  const bidata = response.data?.bi040?.bidata

  return normalizeBidata(bidata)
}

export { execute }

export default {
  execute,
}
import { postComSessao } from '../../../config/birelClient.js'
import { toYYYYMMDD } from '../../../utils/date.js'
import { normalizeBidata } from '../responseUtils.js'

async function execute(dataYYYYMMDD) {
  const data = toYYYYMMDD(dataYYYYMMDD)

  const response = await postComSessao('(LOJ_FAT_FATURA)', {
    datalojfatura: data,
  })

  return normalizeBidata(response.data?.bi006?.bidata)
}

export default { execute }
export { execute }

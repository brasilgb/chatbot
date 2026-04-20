import { postComSessao } from '../../../config/birelClient.js'

async function execute(dataYYYYMMDD) {
  const response = await postComSessao('(LOJ_FAT_FATUTO)', {
    datalojfatuto: dataYYYYMMDD,
  })

  return response.data?.bi007?.bidata ?? []
}

export default { execute }
export { execute }
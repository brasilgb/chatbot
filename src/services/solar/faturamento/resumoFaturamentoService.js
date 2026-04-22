import { postComSessao } from '../../../config/birelClient.js'

async function execute(dataYYYYMMDD) {
  const response = await postComSessao('(LOJ_FAT_FATURA)', {
    datalojfatura: dataYYYYMMDD,
  })

  return response.data?.bi006?.bidata ?? []
}

export default { execute }
export { execute }

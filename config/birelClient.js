import axios from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'

const BASE_URL = 'https://services.gruposolar.com.br:8086/servicesgruposolar/servlet/isCobol'

const jar = new CookieJar()

const birelClient = wrapper(
  axios.create({
    baseURL: BASE_URL,
    jar,
    withCredentials: true,
    timeout: 20000,
  })
)

async function abrirSessao() {
  return await birelClient.get('(biRelatoriosApp)')
}

async function postComSessao(url, payload) {
  try {
    return await birelClient.post(url, payload)
  } catch (error) {
    const session = await abrirSessao()

    if (session.status !== 200) {
      throw new Error('Não foi possível abrir sessão no servidor ISCOBOL')
    }

    return await birelClient.post(url, payload)
  }
}

export { birelClient, abrirSessao, postComSessao }
export default { birelClient, abrirSessao, postComSessao }
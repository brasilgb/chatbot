import { postComSessao } from '../../../config/birelClient.js'
import { toYYYYMMDD } from '../../../utils/date.js'
import { normalizeBidata } from '../responseUtils.js'

/*
{
	"bi040": {
		"success": true,
		"bidata": [
			{
				"DataChave": 20250218,
				"Departamento": 1,
				"Atualizacao": "18/02/2025 14:02:37",
				"Meta": 11000000.0000,
				"Faturamento": 6910770.1693,
				"Projecao": 1.0052,
				"Margem": 0.3452,
				"PrecoMedio": 0.0000,
				"TicketMedio": 0.0000,
				"MetaAlcancada": 0.6282,
				"FaturamentoSemBrasil": 0.0000,
				"MargemSemBrasil": 0.0000,
				"PrecoMedioSemBrasil": 0.0000,
				"VendaAgora": 6918105.4900,
				"VendaDia": 257031.0200,
				"MargemMediaAno": 0.3536,
				"JurosMedioAno": 0.1037,
				"Juros": 0.1076,
				"JuroAgora": 22768.67
			}
		]
	}
}
*/

async function execute(data) {
  const dataYYYYMMDD = toYYYYMMDD(data)
  console.log(`Calling (LOJ_FATU_TOTAL) with date: ${dataYYYYMMDD}`)

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
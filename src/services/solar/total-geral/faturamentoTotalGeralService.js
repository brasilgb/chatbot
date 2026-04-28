import { postComSessao } from "../../../config/birelClient.js";
import { toYYYYMMDD } from "../../../utils/date.js";
import { normalizeBidata } from "../responseUtils.js";

async function execute(dataYYYYMMDD) {
    const data = toYYYYMMDD(dataYYYYMMDD);

    const response = await postComSessao('(LOJ_FATU_TOTAL)', {
        datalojfatutotal: data
    })

    return normalizeBidata(response.data?.bi040?.bidata)
}

export default { execute }
export { execute }
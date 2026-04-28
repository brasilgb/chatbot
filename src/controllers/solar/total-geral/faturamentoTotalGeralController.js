import faturamentoTotalGeralService from "../../../services/solar/total-geral/faturamentoTotalGeralService.js";
import { todayYYYYMMDD, toYYYYMMDD } from "../../../utils/date.js";

async function faturamentoTotalGeral(req, res) {
    try {
        const data = req.query.data
            ? toYYYYMMDD(req.query.data)
            : todayYYYYMMDD()

        const results = await faturamentoTotalGeralService.execute(data)

        return res.json({
            success: true,
            data,
            total: results.length,
            results,
        })
    } catch (error) {
        console.error('Erro em faturamentoTotalGeral:', error.message)

        return res.status(500).json({
            success: false,
            message: 'Erro ao consultar resumo de faturamento',
            error: error.message
        })
    }
}

export { faturamentoTotalGeral };
export default { faturamentoTotalGeral };
const { postComSessao } = require('../../../config/birelClient');

async function execute(dataYYYYMMDD) {
    const response = await postComSessao('(LOJ_FAT_FATURA)', {
        datalojfatura: dataYYYYMMDD,
    });

    return response.data?.bi006?.bidata ?? [];
}

module.exports = {
    execute,
};
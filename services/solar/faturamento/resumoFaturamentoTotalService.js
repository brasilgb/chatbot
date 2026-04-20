const { postComSessao } = require('../../../config/birelClient');

async function execute(dataYYYYMMDD) {
  const response = await postComSessao('(LOJ_FAT_FATUTO)', {
    datalojfatuto: dataYYYYMMDD,
  });

  return response.data?.bi007?.bidata ?? [];
}

module.exports = {
  execute,
};
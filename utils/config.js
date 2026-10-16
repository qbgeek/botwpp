const path = require('path');

const { lerJson, salvarJson } = require('./arquivoJson');

const CAMINHO_CONFIG = path.join(__dirname, '..', 'config.json');


const config = lerJson(CAMINHO_CONFIG, { admins: [] });

config.admins ??= [];


function salvarConfig() {

    salvarJson(CAMINHO_CONFIG, config);

}


// Recebe todos os IDs conhecidos da pessoa (@c.us e @lid)
function ehAdmin(ids) {

    return ids.some(id => config.admins.includes(id));

}


module.exports = {
    config,
    salvarConfig,
    ehAdmin
};

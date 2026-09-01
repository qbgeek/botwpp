const fs = require('fs');

const CAMINHO_CONFIG = './config.json';


function carregarConfig() {

    if (fs.existsSync(CAMINHO_CONFIG)) {

        return JSON.parse(
            fs.readFileSync(CAMINHO_CONFIG)
        );

    }

    return {
        admins: []
    };

}


function salvarConfig(config) {

    fs.writeFileSync(
        CAMINHO_CONFIG,
        JSON.stringify(config, null, 2)
    );

}


module.exports = {
    carregarConfig,
    salvarConfig
};
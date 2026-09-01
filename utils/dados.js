const fs = require('fs');

const CAMINHO_DADOS = './dados_campeonato.json';

function salvarDados(dados) {

    fs.writeFileSync(
        CAMINHO_DADOS,
        JSON.stringify(dados, null, 2)
    );

}


function carregarDados() {

    if (fs.existsSync(CAMINHO_DADOS)) {

        try {

            const raw = fs.readFileSync(CAMINHO_DADOS);

            return JSON.parse(raw);

        } catch (erro) {

            console.log('⚠️ Erro ao carregar dados. Criando novo arquivo.');

            return null;

        }

    }

    return null;

}


function corrigirDados(dados) {

    dados.inscritos ??= [];

    dados.listaEspera ??= [];

    dados.limiteVagas ??= 0;

    dados.limiteEspera ??= 0;

    dados.dataCamp ??= "---";

    dados.horaCamp ??= "---";

    dados.valorEntrada ??= "----";

    dados.metaPremiacao ??= 0;

    dados.premio1 ??= "Não definido";

    dados.premio2 ??= "Não definido";

    dados.premio3 ??= "Não definido";

}


module.exports = {
    salvarDados,
    carregarDados,
    corrigirDados
};
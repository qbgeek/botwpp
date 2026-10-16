// =========================================================
// ARMAZENAMENTO DAS LISTAS
// Cada grupo pode ter várias listas, identificadas pelo nome
// que o ADM escolheu (ex.: "ygo" -> comando !ygo).
//
// dados/listas.json
// {
//   "<id do grupo>": {
//     "nome": "Nome do grupo",
//     "listas": { "ygo": { ...lista }, "cup": { ...lista } }
//   }
// }
// =========================================================

const fs = require('fs');
const path = require('path');

const { lerJson, salvarJson } = require('./arquivoJson');
const { LOJA } = require('./loja');

const CAMINHO_LISTAS = path.join(__dirname, '..', 'dados', 'listas.json');

// Arquivo da versão antiga do bot (uma lista só)
const CAMINHO_LEGADO = path.join(__dirname, '..', 'dados_campeonato.json');


// "MESÃO" -> "mesao" | "#YGO" -> "ygo"
function normalizarChave(texto) {

    return (texto || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

}


function normalizarJogador(jogador) {

    // Versões antigas guardavam só "id"; quem foi adicionado por ADM
    // recebia um ID falso ("ADM_...") que não pertence a ninguém.
    if (!Array.isArray(jogador.ids)) {

        const idFalso = String(jogador.id || '').startsWith('ADM_');

        jogador.ids = jogador.id && !idFalso ? [jogador.id] : [];

        jogador.adicionadoPorAdm ??= idFalso;

    }

    jogador.id = jogador.ids[0] ?? null;
    jogador.pago ??= false;
    jogador.adicionadoPorAdm ??= false;

    return jogador;

}


// Garante que toda lista tenha todos os campos
function normalizarLista(lista) {

    lista.comando ??= lista.chave;
    lista.titulo ??= lista.comando.toUpperCase();

    lista.dataCamp ??= '---';
    lista.horaCamp ??= '---';
    lista.valorEntrada ??= '----';
    lista.local ??= LOJA.endereco;
    lista.premiacaoBase ??= LOJA.premiacaoBase;

    lista.limiteVagas ??= 0;
    lista.limiteEspera ??= 0;

    lista.metaPremiacao ??= 0;
    lista.premio1 ??= 'Não definido';
    lista.premio2 ??= 'Não definido';
    lista.premio3 ??= 'Não definido';

    lista.inscritos ??= [];
    lista.listaEspera ??= [];

    lista.inscritos.forEach(normalizarJogador);
    lista.listaEspera.forEach(normalizarJogador);

    return lista;

}


const grupos = lerJson(CAMINHO_LISTAS, {});

for (const grupo of Object.values(grupos)) {
    Object.values(grupo.listas).forEach(normalizarLista);
}


function salvarListas() {

    salvarJson(CAMINHO_LISTAS, grupos);

}


function listasDoGrupo(chatId) {

    return grupos[chatId]?.listas || {};

}


function obterLista(chatId, chave) {

    return listasDoGrupo(chatId)[chave] || null;

}


// "comando" é o nome como o ADM digitou (ex.: "mesão"); a chave é a versão normalizada
function criarLista(chatId, nomeGrupo, comando, campos = {}) {

    grupos[chatId] ??= { nome: '', listas: {} };

    if (nomeGrupo) {
        grupos[chatId].nome = nomeGrupo;
    }

    const chave = normalizarChave(comando);

    grupos[chatId].listas[chave] = normalizarLista({
        chave,
        comando,
        ...campos,
        criadoEm: new Date().toISOString()
    });

    salvarListas();

    return grupos[chatId].listas[chave];

}


function removerLista(chatId, chave) {

    delete grupos[chatId].listas[chave];

    if (Object.keys(grupos[chatId].listas).length === 0) {
        delete grupos[chatId];
    }

    salvarListas();

}


function todasAsListas() {

    const resultado = [];

    for (const [chatId, grupo] of Object.entries(grupos)) {

        for (const lista of Object.values(grupo.listas)) {
            resultado.push({ chatId, nomeGrupo: grupo.nome, lista });
        }

    }

    return resultado;

}


// ---------------------------------------------------------
// Migração da versão antiga
// ---------------------------------------------------------

function lerLegado() {

    return lerJson(CAMINHO_LEGADO, null);

}


// Renomeia em vez de apagar, para manter um backup
function marcarLegadoImportado() {

    const destino = CAMINHO_LEGADO.replace(/\.json$/, `.importado-${Date.now()}.json`);

    fs.renameSync(CAMINHO_LEGADO, destino);

}


module.exports = {
    normalizarChave,
    listasDoGrupo,
    obterLista,
    criarLista,
    removerLista,
    todasAsListas,
    salvarListas,
    lerLegado,
    marcarLegadoImportado
};

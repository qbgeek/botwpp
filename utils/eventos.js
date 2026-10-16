const fs = require('fs');
const path = require('path');

const { lerJson, salvarJson } = require('./arquivoJson');
const { LOJA } = require('./tiposEvento');

// Um único arquivo com todos os eventos, indexados pelo ID do grupo
const CAMINHO_EVENTOS = path.join(__dirname, '..', 'dados', 'eventos.json');

// Arquivo da versão antiga do bot (um campeonato só)
const CAMINHO_LEGADO = path.join(__dirname, '..', 'dados_campeonato.json');


function normalizarJogador(jogador) {

    // Versões antigas guardavam só "id"; quem foi adicionado por ADM
    // recebia um ID falso ("ADM_...") que não pertence a ninguém.
    if (!Array.isArray(jogador.ids)) {

        const idReal = jogador.id && !String(jogador.id).startsWith('ADM_');

        jogador.ids = idReal ? [jogador.id] : [];

    }

    jogador.id = jogador.ids[0] ?? null;

    return jogador;

}


// Garante que todo evento tenha todos os campos (equivalente ao antigo corrigirDados)
function normalizarEvento(evento) {

    evento.tipo ??= 'outro';
    evento.titulo ??= 'EVENTO QB GEEK';
    evento.emoji ??= '🎲';
    evento.grupo ??= '';

    evento.dataCamp ??= '---';
    evento.horaCamp ??= '---';
    evento.valorEntrada ??= '----';
    evento.local ??= LOJA.endereco;
    evento.premiacaoBase ??= 'Créditos em loja.';

    evento.limiteVagas ??= 0;
    evento.limiteEspera ??= 0;

    evento.metaPremiacao ??= 0;
    evento.premio1 ??= 'Não definido';
    evento.premio2 ??= 'Não definido';
    evento.premio3 ??= 'Não definido';

    evento.inscritos ??= [];
    evento.listaEspera ??= [];

    evento.inscritos.forEach(normalizarJogador);
    evento.listaEspera.forEach(normalizarJogador);

    return evento;

}


const eventos = lerJson(CAMINHO_EVENTOS, {});

Object.values(eventos).forEach(normalizarEvento);


function salvarEventos() {

    salvarJson(CAMINHO_EVENTOS, eventos);

}


function obterEvento(chatId) {

    return eventos[chatId] || null;

}


function criarEvento(chatId, dadosIniciais) {

    eventos[chatId] = normalizarEvento({
        ...dadosIniciais,
        criadoEm: new Date().toISOString()
    });

    salvarEventos();

    return eventos[chatId];

}


function removerEvento(chatId) {

    delete eventos[chatId];

    salvarEventos();

}


function listarEventos() {

    return Object.entries(eventos).map(([chatId, evento]) => ({ chatId, evento }));

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
    obterEvento,
    criarEvento,
    removerEvento,
    listarEventos,
    salvarEventos,
    lerLegado,
    marcarLegadoImportado
};

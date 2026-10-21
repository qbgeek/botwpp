// =========================================================
// ARMAZENAMENTO DAS LISTAS
// As listas são globais: uma lista criada em qualquer grupo
// funciona em todos os grupos do bot (ex.: "ygo" -> !ygo).
//
// dados/listas.json
// {
//   "ygo": { ...lista, "grupoOrigem": "<id do grupo onde foi criada>" },
//   "cup": { ...lista }
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
    lista.grupoOrigem ??= null;
    lista.nomeGrupoOrigem ??= '';

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


// Converte o formato intermediário (listas separadas por grupo) no formato global
function converterFormatoPorGrupo(dados) {

    const listas = {};

    for (const [chatId, grupo] of Object.entries(dados)) {

        for (const [chave, lista] of Object.entries(grupo.listas)) {

            if (!Object.hasOwn(listas, chave)) {
                listas[chave] = { ...lista, grupoOrigem: chatId, nomeGrupoOrigem: grupo.nome || '' };
            }

        }

    }

    return listas;

}


function carregar() {

    const dados = lerJson(CAMINHO_LISTAS, {});

    const formatoPorGrupo = Object.values(dados).some(v => v && typeof v.listas === 'object');

    const listas = formatoPorGrupo ? converterFormatoPorGrupo(dados) : dados;

    Object.values(listas).forEach(normalizarLista);

    return listas;

}


const listas = carregar();


function salvarListas() {

    salvarJson(CAMINHO_LISTAS, listas);

}


function todasAsListas() {

    return Object.values(listas);

}


// Object.hasOwn evita que nomes como "constructor" encontrem
// propriedades internas do JavaScript em vez de uma lista
function obterLista(chave) {

    return Object.hasOwn(listas, chave) ? listas[chave] : null;

}


// "comando" é o nome como o ADM digitou (ex.: "mesão"); a chave é a versão normalizada.
// "origem" guarda o grupo onde a lista foi criada (usado como atalho nos comandos de ADM).
function criarLista(comando, campos = {}, origem = {}) {

    const chave = normalizarChave(comando);

    listas[chave] = normalizarLista({
        chave,
        comando,
        ...campos,
        grupoOrigem: origem.chatId || null,
        nomeGrupoOrigem: origem.nomeGrupo || '',
        criadoEm: new Date().toISOString()
    });

    salvarListas();

    return listas[chave];

}


function removerLista(chave) {

    delete listas[chave];

    salvarListas();

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
    todasAsListas,
    obterLista,
    criarLista,
    removerLista,
    salvarListas,
    lerLegado,
    marcarLegadoImportado
};

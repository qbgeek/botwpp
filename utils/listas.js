// =========================================================
// OPERAÇÕES NOS JOGADORES DE UMA LISTA
// Cada jogador: { nome, id, ids, pago, adicionadoPorAdm }
//   ids = todos os IDs de WhatsApp da pessoa (vazio se foi
//         adicionada por ADM sem marcação)
// =========================================================

const TAMANHO_MAXIMO_NOME = 40;


function limparNome(texto) {

    return (texto || '')
        .replace(/@\d+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, TAMANHO_MAXIMO_NOME);

}


function nomeEmUso(lista, nome, ignorar = null) {

    const procurado = nome.toLowerCase();

    return [...lista.inscritos, ...lista.listaEspera].some(
        j => j !== ignorar && j.nome.toLowerCase() === procurado
    );

}


function encontrarJogador(lista, ids) {

    if (!ids.length) {
        return null;
    }

    for (const parte of ['inscritos', 'listaEspera']) {

        const indice = lista[parte].findIndex(
            j => j.ids.some(id => ids.includes(id))
        );

        if (indice !== -1) {
            return { parte, indice, jogador: lista[parte][indice] };
        }

    }

    return null;

}


// Vaga paga ou criada pelo ADM só sai pela mão de um ADM
function podeSairSozinho(jogador) {

    return !jogador.pago && !jogador.adicionadoPorAdm;

}


// Retorna 'inscritos', 'listaEspera' ou null (tudo lotado)
function adicionarJogador(lista, jogador) {

    if (lista.inscritos.length < lista.limiteVagas) {

        lista.inscritos.push(jogador);

        return 'inscritos';

    }

    if (lista.listaEspera.length < lista.limiteEspera) {

        lista.listaEspera.push(jogador);

        return 'listaEspera';

    }

    return null;

}


// Sobe gente da fila de espera enquanto houver vaga livre
function preencherVagas(lista) {

    const promovidos = [];

    while (
        lista.inscritos.length < lista.limiteVagas &&
        lista.listaEspera.length > 0
    ) {

        const jogador = lista.listaEspera.shift();

        lista.inscritos.push(jogador);

        promovidos.push(jogador);

    }

    return promovidos;

}


function removerJogador(lista, parte, indice) {

    const [removido] = lista[parte].splice(indice, 1);

    const promovidos = preencherVagas(lista);

    return { removido, promovidos };

}


// Começa uma nova edição: mantém título, local, valor, premiação base e vagas
function limparLista(lista) {

    lista.inscritos = [];
    lista.listaEspera = [];
    lista.dataCamp = '---';
    lista.horaCamp = '---';
    lista.metaPremiacao = 0;
    lista.premio1 = 'Não definido';
    lista.premio2 = 'Não definido';
    lista.premio3 = 'Não definido';

}


// "3" -> 3º inscrito | "e2" -> 2º da fila de espera
function lerPosicao(texto) {

    const partes = /^(e?)(\d+)$/i.exec((texto || '').trim());

    if (!partes) {
        return null;
    }

    return {
        parte: partes[1] ? 'listaEspera' : 'inscritos',
        indice: Number(partes[2]) - 1
    };

}


function descreverPosicao(parte, indice) {

    return parte === 'inscritos'
        ? `nº ${indice + 1} da lista`
        : `${indice + 1}º da fila de espera`;

}


module.exports = {
    limparNome,
    nomeEmUso,
    encontrarJogador,
    podeSairSozinho,
    adicionarJogador,
    preencherVagas,
    removerJogador,
    limparLista,
    lerPosicao,
    descreverPosicao
};

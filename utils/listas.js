// =========================================================
// OPERAÇÕES NAS LISTAS DE UM EVENTO
// Cada jogador: { nome, id, ids }
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


function nomeEmUso(evento, nome, ignorar = null) {

    const procurado = nome.toLowerCase();

    return [...evento.inscritos, ...evento.listaEspera].some(
        j => j !== ignorar && j.nome.toLowerCase() === procurado
    );

}


function encontrarJogador(evento, ids) {

    if (!ids.length) {
        return null;
    }

    for (const lista of ['inscritos', 'listaEspera']) {

        const indice = evento[lista].findIndex(
            j => j.ids.some(id => ids.includes(id))
        );

        if (indice !== -1) {
            return { lista, indice, jogador: evento[lista][indice] };
        }

    }

    return null;

}


// Retorna 'inscritos', 'listaEspera' ou null (tudo lotado)
function adicionarJogador(evento, jogador) {

    if (evento.inscritos.length < evento.limiteVagas) {

        evento.inscritos.push(jogador);

        return 'inscritos';

    }

    if (evento.listaEspera.length < evento.limiteEspera) {

        evento.listaEspera.push(jogador);

        return 'listaEspera';

    }

    return null;

}


// Sobe gente da fila de espera enquanto houver vaga livre
function preencherVagas(evento) {

    const promovidos = [];

    while (
        evento.inscritos.length < evento.limiteVagas &&
        evento.listaEspera.length > 0
    ) {

        const jogador = evento.listaEspera.shift();

        evento.inscritos.push(jogador);

        promovidos.push(jogador);

    }

    return promovidos;

}


function removerJogador(evento, lista, indice) {

    const [removido] = evento[lista].splice(indice, 1);

    const promovidos = preencherVagas(evento);

    return { removido, promovidos };

}


// "3" -> 3º inscrito | "e2" -> 2º da fila de espera
function lerPosicao(texto) {

    const partes = /^(e?)(\d+)$/i.exec((texto || '').trim());

    if (!partes) {
        return null;
    }

    return {
        lista: partes[1] ? 'listaEspera' : 'inscritos',
        indice: Number(partes[2]) - 1
    };

}


function descreverPosicao(lista, indice) {

    return lista === 'inscritos'
        ? `nº ${indice + 1} da lista`
        : `${indice + 1}º da fila de espera`;

}


module.exports = {
    limparNome,
    nomeEmUso,
    encontrarJogador,
    adicionarJogador,
    preencherVagas,
    removerJogador,
    lerPosicao,
    descreverPosicao
};

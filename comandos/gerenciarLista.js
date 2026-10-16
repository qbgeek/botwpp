const {
    limparNome,
    nomeEmUso,
    encontrarJogador,
    removerJogador,
    lerPosicao,
    descreverPosicao
} = require('../utils/listas');

const { resolverIds, idsMencionados, mencionar } = require('../utils/identidade');
const { anunciarPromovidos } = require('../utils/efeitos');


// Lê a posição do 1º argumento ("3" ou "e2") e devolve o jogador nela
function jogadorNaPosicao(ctx) {

    const [textoPosicao, ...resto] = ctx.args.split(/\s+/);

    const posicao = lerPosicao(textoPosicao);

    if (!posicao) {
        return { posicao: null, resto };
    }

    const jogador = ctx.lista[posicao.parte][posicao.indice] || null;

    return { posicao, jogador, resto };

}


const POSICAO_INVALIDA = '❌ Posição inválida. Confira os números na lista.';


// !pago 14 -> coloca o 🆗 ao lado do nome
async function pago(ctx) {

    const { posicao, jogador } = jogadorNaPosicao(ctx);

    if (!posicao) {
        return ctx.responder('❌ Informe a posição.\n\nExemplo: *!pago 14*\nFila de espera: *!pago e1*');
    }

    if (!jogador) {
        return ctx.responder(POSICAO_INVALIDA);
    }

    if (jogador.pago) {
        return ctx.responder(`🆗 *${jogador.nome}* já está marcado como pago.`);
    }

    jogador.pago = true;

    ctx.salvar();

    await ctx.reagir('🆗');

    return ctx.responderComLista(`🆗 Pagamento confirmado: *${jogador.nome}*`);

}


async function naoPago(ctx) {

    const { posicao, jogador } = jogadorNaPosicao(ctx);

    if (!posicao) {
        return ctx.responder('❌ Informe a posição.\n\nExemplo: *!naopago 14*');
    }

    if (!jogador) {
        return ctx.responder(POSICAO_INVALIDA);
    }

    if (!jogador.pago) {
        return ctx.responder(`*${jogador.nome}* não está marcado como pago.`);
    }

    jogador.pago = false;

    ctx.salvar();

    await ctx.reagir('↩️');

    return ctx.responderComLista(`↩️ Pagamento desmarcado: *${jogador.nome}*`);

}


async function alterar(ctx) {

    const { posicao, jogador, resto } = jogadorNaPosicao(ctx);

    const novoNome = limparNome(resto.join(' '));

    if (!posicao || !novoNome) {
        return ctx.responder('❌ Use assim:\n!alterar [nº] [nome]\n\nFila de espera: !alterar e1 [nome]');
    }

    if (!jogador) {
        return ctx.responder(POSICAO_INVALIDA);
    }

    if (nomeEmUso(ctx.lista, novoNome, jogador)) {
        return ctx.responder(`❌ ${novoNome} já está na lista!`);
    }

    const nomeAntigo = jogador.nome;

    jogador.nome = novoNome;

    ctx.salvar();

    await ctx.reagir('✏️');

    return ctx.responderComLista(`✅ Alterado!\nAntes: ${nomeAntigo}\nAgora: ${novoNome}`);

}


async function remover(ctx) {

    const { posicao, jogador } = jogadorNaPosicao(ctx);

    if (!posicao) {
        return ctx.responder('❌ Informe um número válido.\n\nExemplo:\n!remover 3\n!remover e1 (fila de espera)');
    }

    if (!jogador) {
        return ctx.responder(POSICAO_INVALIDA);
    }

    const { removido, promovidos } = removerJogador(ctx.lista, posicao.parte, posicao.indice);

    ctx.salvar();

    await ctx.reagir('🗑️');

    const origem = posicao.parte === 'inscritos' ? 'da lista' : 'da fila de espera';

    const promocao = anunciarPromovidos(promovidos);

    return ctx.responderComLista(
        `🗑️ *${removido.nome}* foi removido ${origem}.${promocao.texto}`,
        promocao.mencoes
    );

}


// !vincular 3 @pessoa -> liga uma vaga ao WhatsApp da pessoa
// (passa a marcá-la quando subir da espera e evita inscrição dupla)
async function vincular(ctx) {

    const { posicao, jogador } = jogadorNaPosicao(ctx);

    const [mencionado] = idsMencionados(ctx.msg);

    if (!posicao || !mencionado) {
        return ctx.responder('❌ Use assim:\n!vincular [nº] @pessoa');
    }

    if (!jogador) {
        return ctx.responder(POSICAO_INVALIDA);
    }

    const ids = await resolverIds(ctx.client, mencionado);

    const ocupante = encontrarJogador(ctx.lista, ids);

    if (ocupante && ocupante.jogador !== jogador) {

        return ctx.responder(
            `❌ Essa pessoa já está na lista como *${ocupante.jogador.nome}* ` +
            `(${descreverPosicao(ocupante.parte, ocupante.indice)}).`
        );

    }

    jogador.id = mencionado;
    jogador.ids = ids;

    ctx.salvar();

    await ctx.reagir('🔗');

    return ctx.responderComLista(
        `🔗 *${jogador.nome}* (${descreverPosicao(posicao.parte, posicao.indice)}) ` +
        `agora está vinculado a ${mencionar(mencionado)}.`,
        [mencionado]
    );

}


module.exports = {
    pago,
    naoPago,
    alterar,
    remover,
    vincular
};

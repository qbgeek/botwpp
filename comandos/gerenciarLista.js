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

    const jogador = ctx.evento[posicao.lista][posicao.indice] || null;

    return { posicao, jogador, resto };

}


const POSICAO_INVALIDA = '❌ Posição inválida. Confira os números com *!lista*.';


async function alterar(ctx) {

    const { posicao, jogador, resto } = jogadorNaPosicao(ctx);

    const novoNome = limparNome(resto.join(' '));

    if (!posicao || !novoNome) {
        return ctx.responder('❌ Use assim:\n!alterar [nº] [nome]\n\nFila de espera: !alterar e1 [nome]');
    }

    if (!jogador) {
        return ctx.responder(POSICAO_INVALIDA);
    }

    if (nomeEmUso(ctx.evento, novoNome, jogador)) {
        return ctx.responder(`❌ *${novoNome}* já está na lista!`);
    }

    const nomeAntigo = jogador.nome;

    jogador.nome = novoNome;

    ctx.salvar();

    await ctx.reagir('✏️');

    return ctx.responderComLista(`✏️ *Nome alterado!*\nAntes: ${nomeAntigo}\nAgora: *${novoNome}*`);

}


async function remover(ctx) {

    const { posicao, jogador } = jogadorNaPosicao(ctx);

    if (!posicao) {
        return ctx.responder('❌ Informe a posição.\n\nExemplos:\n!remover 3\n!remover e1 (fila de espera)');
    }

    if (!jogador) {
        return ctx.responder(POSICAO_INVALIDA);
    }

    const { removido, promovidos } = removerJogador(ctx.evento, posicao.lista, posicao.indice);

    ctx.salvar();

    await ctx.reagir('🗑️');

    const origem = posicao.lista === 'inscritos' ? 'da lista' : 'da fila de espera';

    const promocao = anunciarPromovidos(promovidos);

    return ctx.responderComLista(
        `🗑️ *${removido.nome}* foi removido(a) ${origem}.${promocao.texto}`,
        promocao.mencoes
    );

}


// Liga uma vaga a uma pessoa do WhatsApp, para que ela possa usar !sair
function vincularJogador(ctx, jogador, id, ids) {

    const ocupante = encontrarJogador(ctx.evento, ids);

    if (ocupante && ocupante.jogador !== jogador) {

        return `❌ Essa pessoa já está na lista como *${ocupante.jogador.nome}* ` +
            `(${descreverPosicao(ocupante.lista, ocupante.indice)}).`;

    }

    jogador.id = id;
    jogador.ids = ids;

    ctx.salvar();

    return null;

}


// ADM: !vincular 3 @pessoa
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

    const erro = vincularJogador(ctx, jogador, mencionado, ids);

    if (erro) {
        return ctx.responder(erro);
    }

    await ctx.reagir('🔗');

    return ctx.responderComLista(
        `🔗 *${jogador.nome}* (${descreverPosicao(posicao.lista, posicao.indice)}) ` +
        `agora está vinculado(a) a ${mencionar(mencionado)}.\nJá pode usar *!sair* quando quiser.`,
        [mencionado]
    );

}


// Jogador: !eusou 3 — assume uma vaga criada por ADM que ainda não tem dono
async function euSou(ctx) {

    const { posicao, jogador } = jogadorNaPosicao(ctx);

    if (!posicao) {
        return ctx.responder('❌ Informe o número da sua posição na *!lista*.\n\nExemplo: !eusou 3');
    }

    if (!jogador) {
        return ctx.responder(POSICAO_INVALIDA);
    }

    if (jogador.ids.length > 0) {

        return ctx.responder(
            jogador.ids.some(id => ctx.idsUsuario.includes(id))
                ? '✅ Essa vaga já é sua!'
                : '❌ Essa vaga já pertence a outra pessoa. Se for um engano, fale com um ADM.'
        );

    }

    const erro = vincularJogador(ctx, jogador, ctx.idUsuario, ctx.idsUsuario);

    if (erro) {
        return ctx.responder(erro.replace('Essa pessoa já está', 'Você já está'));
    }

    await ctx.reagir('🔗');

    return ctx.responderComLista(
        `🔗 ${mencionar(ctx.idUsuario)} confirmou que é *${jogador.nome}* ` +
        `(${descreverPosicao(posicao.lista, posicao.indice)}).\nAgora pode usar *!sair* quando quiser.`,
        [ctx.idUsuario]
    );

}


module.exports = {
    alterar,
    remover,
    vincular,
    euSou
};

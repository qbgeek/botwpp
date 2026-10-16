const { encontrarJogador, removerJogador } = require('../utils/listas');
const { anunciarPromovidos } = require('../utils/efeitos');


module.exports = async function sair(ctx) {

    const { evento } = ctx;

    const encontrado = encontrarJogador(evento, ctx.idsUsuario);

    if (!encontrado) {

        return ctx.responder(
            '❓ Você não está na lista.\n\n' +
            '💡 Se um ADM te adicionou, envie *!eusou [nº]* com o número da sua posição ' +
            'para vincular a vaga a você e depois use *!sair*.'
        );

    }

    const { removido, promovidos } = removerJogador(evento, encontrado.lista, encontrado.indice);

    ctx.salvar();

    await ctx.reagir('👋');

    const origem = encontrado.lista === 'inscritos' ? 'da lista' : 'da fila de espera';

    const promocao = anunciarPromovidos(promovidos);

    return ctx.responderComLista(
        `👋 *${removido.nome}* saiu ${origem}.${promocao.texto}`,
        promocao.mencoes
    );

};

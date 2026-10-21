const { normalizarChave, todasAsListas, obterLista } = require('../utils/armazenamento');
const { encontrarJogador, podeSairSozinho, removerJogador } = require('../utils/listas');
const { anunciarPromovidos } = require('../utils/efeitos');


// !sair      -> sai da única lista em que a pessoa está
// !sair ygo  -> escolhe a lista quando a pessoa está em mais de uma
module.exports = async function sair(ctx) {

    const [nomeLista] = ctx.args.split(/\s+/, 1);

    let candidatas;

    if (nomeLista) {

        const lista = obterLista(normalizarChave(nomeLista));

        if (!lista) {
            return ctx.responder(`❌ Não existe a lista *${nomeLista}*.`);
        }

        candidatas = [lista];

    } else {

        candidatas = todasAsListas();

    }

    const encontrados = candidatas
        .map(lista => ({ lista, encontrado: encontrarJogador(lista, ctx.idsUsuario) }))
        .filter(item => item.encontrado);

    if (encontrados.length === 0) {
        return ctx.responder(nomeLista ? '❓ Você não está nessa lista.' : '❓ Você não está em nenhuma lista.');
    }

    if (encontrados.length > 1) {

        const nomes = encontrados.map(item => `*${item.lista.comando}*`).join(' e ');

        return ctx.responder(
            `🤔 Você está em ${nomes}. De qual quer sair?\n\n` +
            `Exemplo: *!sair ${encontrados[0].lista.comando}*`
        );

    }

    const { lista, encontrado } = encontrados[0];

    if (!podeSairSozinho(encontrado.jogador)) {

        return ctx.responder(
            '🔒 Sua vaga está confirmada pela organização (paga ou adicionada por um ADM).\n\n' +
            'Para sair, fale com um ADM.'
        );

    }

    const { removido, promovidos } = removerJogador(lista, encontrado.parte, encontrado.indice);

    ctx.lista = lista;

    ctx.salvar();

    await ctx.reagir('👋');

    const origem = encontrado.parte === 'inscritos' ? 'da lista' : 'da fila de espera';

    const promocao = anunciarPromovidos(promovidos);

    return ctx.responderComLista(
        `🏃 *${removido.nome}* saiu ${origem}.${promocao.texto}`,
        promocao.mencoes
    );

};

const {
    limparNome,
    nomeEmUso,
    encontrarJogador,
    adicionarJogador,
    descreverPosicao
} = require('../utils/listas');

const { textoRestam } = require('../utils/formatacao');
const { anunciarMeta } = require('../utils/efeitos');


// Chamado pelo comando da própria lista: "!ygo Lucas Chagas"
module.exports = async function participar(ctx) {

    const { lista } = ctx;

    const nome = limparNome(ctx.args);

    // Sem nome só explica; não mostra a lista para não virar o spam do antigo !lista
    if (!nome) {
        return ctx.responder(`✍️ Para entrar: *!${lista.comando} Seu Nome*`);
    }

    if (lista.limiteVagas === 0) {
        return ctx.responder('🔒 Inscrições fechadas no momento. Aguarde os ADMs abrirem as vagas.');
    }

    const jaNaLista = encontrarJogador(lista, ctx.idsUsuario);

    if (jaNaLista) {

        return ctx.responder(
            `⚠️ Você já está na lista como *${jaNaLista.jogador.nome}* ` +
            `(${descreverPosicao(jaNaLista.parte, jaNaLista.indice)}).`
        );

    }

    if (nomeEmUso(lista, nome)) {
        return ctx.responder(`❌ O nome *${nome}* já está na lista! Use um sobrenome ou apelido.`);
    }

    const inscritosAntes = lista.inscritos.length;

    const destino = adicionarJogador(lista, {
        nome,
        id: ctx.idUsuario,
        ids: ctx.idsUsuario,
        pago: false,
        adicionadoPorAdm: false
    });

    if (!destino) {

        await ctx.reagir('🚫');

        return ctx.responder('🚫 Inscrições e fila de espera lotadas!');

    }

    ctx.salvar();

    if (destino === 'inscritos') {

        await ctx.reagir('✅');

        return ctx.responderComLista(
            `✅ *${nome}* inscrito!\n\n${textoRestam(lista)}${anunciarMeta(lista, inscritosAntes)}`
        );

    }

    await ctx.reagir('⏳');

    return ctx.responderComLista(
        `⏳ Vagas cheias! *${nome}* entrou na fila de espera (${lista.listaEspera.length}º da fila).`
    );

};

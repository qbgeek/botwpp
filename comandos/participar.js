const {
    limparNome,
    nomeEmUso,
    encontrarJogador,
    adicionarJogador,
    descreverPosicao
} = require('../utils/listas');

const { nomeDoContato } = require('../utils/identidade');
const { celebrarMeta } = require('../utils/efeitos');


module.exports = async function participar(ctx) {

    const { evento } = ctx;

    if (evento.limiteVagas === 0) {
        return ctx.responder('🔒 Inscrições fechadas no momento. Aguarde os ADMs abrirem as vagas.');
    }

    const jaNaLista = encontrarJogador(evento, ctx.idsUsuario);

    if (jaNaLista) {

        return ctx.responder(
            `⚠️ Você já está na lista como *${jaNaLista.jogador.nome}* ` +
            `(${descreverPosicao(jaNaLista.lista, jaNaLista.indice)}).`
        );

    }

    // Sem nome digitado, usa o nome do perfil do WhatsApp
    const nome = limparNome(ctx.args) || limparNome(await nomeDoContato(ctx.client, ctx.idUsuario));

    if (!nome) {
        return ctx.responder('❌ Digite seu nome!\n\nExemplo: *!participar João*');
    }

    if (nomeEmUso(evento, nome)) {
        return ctx.responder(`❌ O nome *${nome}* já está na lista! Use um sobrenome ou apelido.`);
    }

    const inscritosAntes = evento.inscritos.length;

    const destino = adicionarJogador(evento, {
        nome,
        id: ctx.idUsuario,
        ids: ctx.idsUsuario
    });

    if (!destino) {

        await ctx.reagir('🚫');

        return ctx.responder('🚫 Inscrições e fila de espera lotadas!');

    }

    ctx.salvar();

    if (destino === 'inscritos') {

        await ctx.reagir('✅');

        const lotou = evento.inscritos.length === evento.limiteVagas;

        await ctx.responderComLista(
            `✅ *${nome}* está inscrito(a)! Boa sorte! 🍀` +
            (lotou ? `\n\n🔒 Essa foi a última vaga — lista completa!` : '')
        );

    } else {

        await ctx.reagir('⏳');

        await ctx.responderComLista(
            `⏳ Vagas cheias! *${nome}* entrou na fila de espera ` +
            `(${evento.listaEspera.length}º da fila).`
        );

    }

    await celebrarMeta(ctx, inscritosAntes);

};

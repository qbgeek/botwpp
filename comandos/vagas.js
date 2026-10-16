const { preencherVagas } = require('../utils/listas');
const { anunciarPromovidos, celebrarMeta } = require('../utils/efeitos');
const { plural } = require('../utils/formatacao');


function lerNumero(ctx) {

    return parseInt(ctx.args.split(/\s+/)[0], 10);

}


async function vagas(ctx) {

    const { evento } = ctx;

    const valor = lerNumero(ctx);

    if (isNaN(valor)) {
        return ctx.responder('❌ Informe um número válido.\n\nExemplo:\n!vagas 20');
    }

    if (valor <= 0) {
        return ctx.responder('❌ O número de vagas deve ser maior que zero.');
    }

    if (valor < evento.inscritos.length) {

        return ctx.responder(
            `❌ Existem ${evento.inscritos.length} jogadores inscritos.\n\n` +
            `Defina pelo menos ${evento.inscritos.length} vagas.`
        );

    }

    const inscritosAntes = evento.inscritos.length;

    evento.limiteVagas = valor;

    // Se abriram vagas novas, a fila de espera sobe automaticamente
    const promovidos = preencherVagas(evento);

    ctx.salvar();

    await ctx.reagir('📏');

    const promocao = anunciarPromovidos(promovidos);

    await ctx.responderComLista(
        `📏 Vagas definidas: *${valor}*${promocao.texto}`,
        promocao.mencoes
    );

    await celebrarMeta(ctx, inscritosAntes);

}


async function espera(ctx) {

    const { evento } = ctx;

    const valor = lerNumero(ctx);

    if (isNaN(valor)) {
        return ctx.responder('❌ Informe um número válido.\n\nExemplo:\n!espera 10');
    }

    if (valor < 0) {
        return ctx.responder('❌ O limite da espera não pode ser negativo.');
    }

    if (valor < evento.listaEspera.length) {

        return ctx.responder(
            `❌ Existem ${evento.listaEspera.length} jogadores na fila de espera.\n\n` +
            `Defina pelo menos ${evento.listaEspera.length} vagas de espera.`
        );

    }

    evento.limiteEspera = valor;

    ctx.salvar();

    await ctx.reagir('⏳');

    return ctx.responderComLista(`⏳ Fila de espera definida: *${plural(valor, 'vaga', 'vagas')}*`);

}


module.exports = {
    vagas,
    espera
};

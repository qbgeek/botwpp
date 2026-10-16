const { preencherVagas } = require('../utils/listas');
const { anunciarPromovidos, anunciarMeta } = require('../utils/efeitos');
const { plural, vagasRestantes } = require('../utils/formatacao');


function lerNumero(ctx) {

    return parseInt(ctx.args.split(/\s+/)[0], 10);

}


async function vagas(ctx) {

    const { lista } = ctx;

    const valor = lerNumero(ctx);

    if (isNaN(valor)) {
        return ctx.responder('❌ Informe um número válido.\n\nExemplo:\n!vagas 20');
    }

    if (valor <= 0) {
        return ctx.responder('❌ O número de vagas deve ser maior que zero.');
    }

    if (valor < lista.inscritos.length) {

        return ctx.responder(
            `❌ Existem ${lista.inscritos.length} jogadores inscritos.\n\n` +
            `Defina pelo menos ${lista.inscritos.length} vagas.`
        );

    }

    const inscritosAntes = lista.inscritos.length;

    lista.limiteVagas = valor;

    // Se abriram vagas novas, a fila de espera sobe automaticamente
    const promovidos = preencherVagas(lista);

    ctx.salvar();

    await ctx.reagir('📏');

    const resumo =
        `📏 Vagas definidas (*${lista.comando}*): *${valor}*\n` +
        `📋 Restam: *${plural(vagasRestantes(lista), 'vaga', 'vagas')}*`;

    // Só mostra a lista inteira se alguém mudou de lugar
    if (promovidos.length === 0) {
        return ctx.responder(resumo);
    }

    const promocao = anunciarPromovidos(promovidos);

    return ctx.responderComLista(
        `${resumo}${promocao.texto}${anunciarMeta(lista, inscritosAntes)}`,
        promocao.mencoes
    );

}


async function espera(ctx) {

    const { lista } = ctx;

    const valor = lerNumero(ctx);

    if (isNaN(valor)) {
        return ctx.responder('❌ Informe um número válido.\n\nExemplo:\n!espera 10');
    }

    if (valor < 0) {
        return ctx.responder('❌ O limite da espera não pode ser negativo.');
    }

    if (valor < lista.listaEspera.length) {

        return ctx.responder(
            `❌ Existem ${lista.listaEspera.length} jogadores na fila de espera.\n\n` +
            `Defina pelo menos ${lista.listaEspera.length} vagas de espera.`
        );

    }

    lista.limiteEspera = valor;

    ctx.salvar();

    await ctx.reagir('⏳');

    return ctx.responder(`⏳ Fila de espera (*${lista.comando}*): *${plural(valor, 'reserva', 'reservas')}*`);

}


module.exports = {
    vagas,
    espera
};

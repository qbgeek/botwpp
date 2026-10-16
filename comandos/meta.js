const gerarBarraMeta = require('../utils/barraMeta');
const { linhasPremios, plural } = require('../utils/formatacao');


async function definirMeta(ctx) {

    if (!ctx.ehAdm) {
        return ctx.responder('🔒 Só ADMs podem definir a meta. Para ver o desafio, envie apenas *!meta*.');
    }

    const valor = parseInt(ctx.args.split(/\s+/)[0], 10);

    if (isNaN(valor) || valor < 0) {
        return ctx.responder('❌ Use assim: !meta 20\n\n(!meta 0 desativa a meta)');
    }

    ctx.lista.metaPremiacao = valor;

    ctx.salvar();

    await ctx.reagir('🔥');

    return ctx.responder(
        valor === 0
            ? `🔥 Meta desativada (*${ctx.lista.comando}*).`
            : `🔥 Meta definida (*${ctx.lista.comando}*): *${plural(valor, 'jogador', 'jogadores')}*`
    );

}


async function mostrarMeta(ctx) {

    const { lista } = ctx;

    const inscritos = lista.inscritos.length;
    const meta = lista.metaPremiacao;

    const linhas = [`🔥 *DESAFIO — ${lista.titulo}* 🔥`, ''];

    if (meta === 0) {

        linhas.push('⏳ A meta de premiação ainda não foi definida pela organização.');

        return ctx.responder(linhas.join('\n'));

    }

    const progresso = gerarBarraMeta(inscritos, meta);

    linhas.push(
        `${progresso.barra}  *${progresso.porcentagem}%*`,
        `👥 *${inscritos}/${meta} jogadores*`,
        ''
    );

    if (inscritos >= meta) {

        linhas.push(
            '🎉 *META ATINGIDA!*',
            '',
            '🎁 *PREMIAÇÃO ESPECIAL:*'
        );

    } else {

        linhas.push(
            `🚀 Faltam apenas *${plural(meta - inscritos, 'jogador', 'jogadores')}!*`,
            '🔥 Mais jogadores = premiação melhor!',
            '',
            '🎁 *Premiação ao atingir a meta:*'
        );

    }

    linhas.push(...linhasPremios(lista));

    return ctx.responder(linhas.join('\n'));

}


// "!meta" mostra o desafio; "!meta N" (ADM) define a meta
module.exports = async function meta(ctx) {

    return ctx.args ? definirMeta(ctx) : mostrarMeta(ctx);

};

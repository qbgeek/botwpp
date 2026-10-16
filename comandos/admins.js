const { config, salvarConfig } = require('../utils/config');
const { resolverIds, idsMencionados, mencionar } = require('../utils/identidade');


// Aceita "@pessoa", um ID completo ou só o número de telefone
function lerAlvo(ctx) {

    const [mencionado] = idsMencionados(ctx.msg);

    if (mencionado) {
        return mencionado;
    }

    const texto = ctx.args.split(/\s+/)[0];

    if (!texto) {
        return null;
    }

    if (texto.includes('@')) {
        return texto;
    }

    const numero = texto.replace(/\D/g, '');

    return numero ? `${numero}@c.us` : null;

}


async function adicionar(ctx) {

    const alvo = lerAlvo(ctx);

    if (!alvo) {
        return ctx.responder('❌ Informe um ID ou marque a pessoa.\n\nExemplo:\n!addadm @Fulano');
    }

    const ids = await resolverIds(ctx.client, alvo);

    if (ids.some(i => config.admins.includes(i))) {
        return ctx.responder('⚠️ Essa pessoa já é ADM.');
    }

    config.admins.push(alvo);

    salvarConfig();

    await ctx.reagir('👑');

    return ctx.responder(
        `👑 Novo ADM adicionado!\n\n${mencionar(alvo)}`,
        { mentions: [alvo] }
    );

}


async function remover(ctx) {

    const alvo = lerAlvo(ctx);

    if (!alvo) {
        return ctx.responder('❌ Informe um ID ou marque a pessoa.\n\nExemplo:\n!deladm @Fulano');
    }

    const ids = await resolverIds(ctx.client, alvo);

    const antes = config.admins.length;

    config.admins = config.admins.filter(i => !ids.includes(i));

    if (config.admins.length === antes) {
        return ctx.responder('❌ Essa pessoa não é ADM.');
    }

    salvarConfig();

    await ctx.reagir('🗑️');

    return ctx.responder(`🗑️ ADM removido!\n\n${alvo}`);

}


async function listar(ctx) {

    if (config.admins.length === 0) {
        return ctx.responder('📜 Nenhum ADM cadastrado. Só o número do bot tem acesso de ADM.');
    }

    const linhas = config.admins.map((id, i) => `${i + 1}. ${id}`);

    return ctx.responder(`📜 *ADMs (${config.admins.length})*\n\n${linhas.join('\n')}`);

}


module.exports = {
    adicionar,
    remover,
    listar
};

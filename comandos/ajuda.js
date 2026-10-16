const { LOJA } = require('../utils/tiposEvento');


module.exports = async function ajuda(ctx) {

    const linhas = [`🤖 *COMANDOS ${LOJA.nome}*`];

    if (ctx.evento) {
        linhas.push(`${ctx.evento.emoji} Evento deste grupo: *${ctx.evento.titulo}*`);
    }

    linhas.push(
        '',
        '🎮 *JOGADORES*',
        '📝 *!participar [Nome]* — entra na lista',
        '📋 *!lista* — inscritos e fila de espera',
        '🏃 *!sair* — sai da lista',
        '🔗 *!eusou [nº]* — assume a vaga que um ADM criou pra você',
        '🔥 *!meta* — desafio da premiação',
        '🆔 *!id* — mostra seu ID'
    );

    if (ctx.ehAdm) {

        linhas.push(
            '',
            '👑 *ADM — EVENTOS*',
            '🎉 *!criarevento [pokemon | magic | yugioh | nome livre]*',
            '🏁 *!encerrarevento*',
            '📅 *!eventos* — eventos ativos em todos os grupos',
            '📦 *!importarlegado [tipo]* — traz a lista da versão antiga',
            '',
            '⚙️ *ADM — CONFIGURAÇÃO*',
            '🏷️ *!settitulo [título]*',
            '📅 *!setdata [data]*',
            '⏰ *!sethora [hora]*',
            '💰 *!setvalor [valor]*',
            '📍 *!setlocal [endereço]*',
            '🎁 *!setbase [premiação base]*',
            '📏 *!vagas [nº]*',
            '⏳ *!espera [nº]*',
            '🔥 *!meta [nº de jogadores]* (0 desativa)',
            '🥇 *!premio1 [prêmio]*',
            '🥈 *!premio2 [prêmio]*',
            '🥉 *!premio3 [prêmio]*',
            '🧹 *!limparpremios*',
            '',
            '📋 *ADM — LISTA*',
            '➕ *!add [Nome]* ou *!add @pessoa*',
            '✏️ *!alterar [nº] [Nome]*',
            '🗑️ *!remover [nº]*',
            '🔗 *!vincular [nº] @pessoa*',
            '_Use e1, e2... para posições da fila de espera._',
            '🔄 *!limparlista* → *!confirmarlimpeza*',
            '📢 *!todos [mensagem]*',
            '',
            '🛡️ *ADM — PERMISSÕES*',
            '👤 *!addadm [ID ou @pessoa]*',
            '❌ *!deladm [ID ou @pessoa]*',
            '📜 *!admins*'
        );

    }

    return ctx.responder(linhas.join('\n'));

};

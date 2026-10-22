// !neymar (ou !ajudaney). Os comandos de cada lista (!ygo, !cup...)
// não aparecem aqui: o comando de entrada é mostrado no fim da própria lista.
module.exports = async function ajuda(ctx) {

    const linhas = [
        '🤖 *COMANDOS CYBERNEMAR 100% QB*',
        '',
        '📝 *!nomedalista Seu Nome* — entra na lista (o comando aparece no fim de cada lista)',
        '🏃 *!sair* — sai da lista',
        '🔥 *!meta* — desafio da premiação'
    ];

    if (ctx.ehAdm) {

        linhas.push(
            '',
            '👑 *ADM — LISTAS*',
            '🆕 *!lista #nome data hora vagas reservas valor*',
            '    ex.: !lista #ygo 30/10/2026 18h30 24 12 R$ 20,00',
            '    _cria a lista (vale em todos os grupos); se já existir, recomeça uma nova edição_',
            '👀 *!lista #nome* — ver a lista',
            '📚 *!listas* — listas abertas',
            '🔄 *!limparlista [lista]*',
            '🗑️ *!excluirlista [lista]*',
            '✅ *!confirmar* — confirma limpar, recomeçar ou excluir',
            '',
            '⚙️ *ADM — AJUSTES*',
            '_O nome da lista é opcional se só existir uma lista, ou uma criada neste grupo._',
            '_Os ajustes também funcionam no privado do bot._',
            '📅 *!setdata [lista] data*',
            '⏰ *!sethora [lista] hora*',
            '💰 *!setvalor [lista] valor*',
            '🏷️ *!settitulo [lista] título*',
            '📍 *!setlocal [lista] endereço*',
            '🎁 *!setbase [lista] premiação base*',
            '📏 *!vagas [lista] nº*',
            '⏳ *!espera [lista] nº*',
            '🔥 *!meta [lista] nº* (0 desativa)',
            '🥇 *!premio1 [lista] prêmio*',
            '🥈 *!premio2 [lista] prêmio*',
            '🥉 *!premio3 [lista] prêmio*',
            '🧹 *!limparpremios [lista]*',
            '',
            '📋 *ADM — JOGADORES*',
            '➕ *!add [lista] Nome* ou *!add [lista] @pessoa*',
            '🆗 *!pago [lista] nº* / ↩️ *!naopago [lista] nº*',
            '✏️ *!alterar [lista] nº Nome*',
            '🗑️ *!remover [lista] nº*',
            '🔗 *!vincular [lista] nº @pessoa*',
            '_Use e1, e2... para a fila de espera._',
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

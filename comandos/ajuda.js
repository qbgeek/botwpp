module.exports = async function ajuda(msg, ehAdm) {

    let menu = `🤖 *COMANDOS QB GEEK*\n\n`;

    menu += `📝 *!participar [Nome]*\n`;
    menu += `📋 *!lista* (Ver inscritos e espera)\n`;
    menu += `🏃 *!sair* (Sai da lista)\n`;
    menu += `🔥 *!meta* (Ver desafio da premiação)\n`;
    menu += `🆔 *!id* (Consultar ID)\n`;

    if (ehAdm) {

        menu += `\n👑 *COMANDOS ADM:*\n`;

        menu += `📅 *!setdata [data]*\n`;
        menu += `⏰ *!sethora [hora]*\n`;
        menu += `💰 *!setvalor [valor]*\n`;
        menu += `📏 *!vagas [nº]*\n`;
        menu += `⏳ *!espera [nº]*\n`;
        menu += `📢 *!todos*\n`;
        menu += `➕ *!add [Nome]*\n`;
        menu += `👤 *!addadm [ID]*\n`;
        menu += `❌ *!deladm [ID]*\n`;
        menu += `🔥 *!meta [nº jogadores]*\n`;
        menu += `✏️ *!alterar [nº] [Nome]*\n`;
        menu += `🥇 *!premio1 [Prêmio]*\n`;
        menu += `🥈 *!premio2 [Prêmio]*\n`;
        menu += `🥉 *!premio3 [Prêmio]*\n`;
        menu += `🧹 *!limparpremios*\n`;
        menu += `🗑️ *!remover [nº]*\n`;
        menu += `🔄 *!limparlista*\n`;
        menu += `⚠️ *!confirmarlimpeza*\n`;

    }

    return msg.reply(menu);

};
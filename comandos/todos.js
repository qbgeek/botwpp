const { lerChat } = require('../utils/whatsapp');


// Marca todos do grupo onde o comando foi dado (só ADM, ver comandos/index.js).
// O texto mostra apenas "@all". Por baixo:
//   - todos os participantes vão em "mentions" (marcação oculta), o que
//     garante a notificação mesmo em versões do WhatsApp sem o @all;
//   - "nonJidMentions: 1" pede o @all nativo do WhatsApp (o mesmo campo
//     usado por outras bibliotecas). Se o WhatsApp Web recusar o campo,
//     a mensagem é reenviada sem ele.
async function enviarParaTodos(ctx, texto, participantes) {

    try {

        return await ctx.responder(texto, { mentions: participantes, extra: { nonJidMentions: 1 } });

    } catch (erro) {

        console.log('⚠️ @all nativo não aceito pelo WhatsApp Web; enviando só com a marcação oculta:', erro.message);

        return ctx.responder(texto, { mentions: participantes });

    }

}


module.exports = async function todos(ctx) {

    const chat = await lerChat(ctx.client, ctx.chatId);

    if (!chat || chat.participantes.length === 0) {
        return ctx.responder('❌ Não consegui ler os participantes do grupo. Tente de novo em instantes.');
    }

    const aviso = ctx.args || 'Atenção, pessoal!';

    return enviarParaTodos(ctx, `📢 🔔 ${aviso}\n\n@all`, chat.participantes);

};

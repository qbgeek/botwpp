const { lerChat } = require('../utils/whatsapp');


// Marca todos os participantes do grupo sem poluir o texto com @nomes
module.exports = async function todos(ctx) {

    const chat = await lerChat(ctx.client, ctx.chatId);

    if (!chat || chat.participantes.length === 0) {
        return ctx.responder('❌ Não consegui ler os participantes do grupo. Tente de novo em instantes.');
    }

    const aviso = ctx.args || 'Atenção, pessoal!';

    return ctx.responder(`📢 🔔 ${aviso}`, { mentions: chat.participantes });

};

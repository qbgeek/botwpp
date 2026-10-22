const { lerChat } = require('../utils/whatsapp');
const { mencionar } = require('../utils/identidade');


// Marca todos os participantes do grupo onde o comando foi dado (só ADM, ver comandos/index.js).
// Os @ ficam visíveis no texto, para cada pessoa ver que foi marcada.
module.exports = async function todos(ctx) {

    const chat = await lerChat(ctx.client, ctx.chatId);

    if (!chat || chat.participantes.length === 0) {
        return ctx.responder('❌ Não consegui ler os participantes do grupo. Tente de novo em instantes.');
    }

    const aviso = ctx.args || 'Atenção, pessoal!';

    const marcacoes = chat.participantes.map(mencionar).join(' ');

    return ctx.responder(`📢 🔔 ${aviso}\n\n${marcacoes}`, { mentions: chat.participantes });

};

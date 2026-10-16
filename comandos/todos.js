// Marca todos os participantes do grupo sem poluir o texto com @nomes
module.exports = async function todos(ctx) {

    const chat = await ctx.msg.getChat();

    const mencoes = chat.participants.map(p => p.id._serialized);

    const aviso = ctx.args || 'Atenção, pessoal!';

    return ctx.responder(`📢 🔔 ${aviso}`, { mentions: mencoes });

};

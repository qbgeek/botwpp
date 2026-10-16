// Marca todos os participantes do grupo sem poluir o texto com @nomes
module.exports = async function todos(ctx) {

    const chat = await ctx.msg.getChat();

    const mencoes = chat.participants.map(p => p.id._serialized);

    const titulo = ctx.evento ? `${ctx.evento.emoji} *${ctx.evento.titulo}*\n\n` : '';

    const aviso = ctx.args || 'Atenção, pessoal!';

    return ctx.responder(`📢 ${titulo}🔔 ${aviso}`, { mentions: mencoes });

};

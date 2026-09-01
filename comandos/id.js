module.exports = async function (msg, verificarSeEhAdm) {

    const autorizado = await verificarSeEhAdm(msg);

    if (!autorizado) {
        return msg.reply('❌ Apenas administradores podem consultar IDs.');
    }

    const id = msg.author || msg.from;

    await msg.reply(
        `🆔 Seu ID é:\n${id}`
    );

};
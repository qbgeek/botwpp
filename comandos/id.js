const { idsMencionados, mencionar } = require('../utils/identidade');


// Mostra só o ID como ele aparece nesta conversa. Em grupos isso
// costuma ser o @lid, que não expõe o número de telefone.
module.exports = async function id(ctx) {

    const [mencionado] = idsMencionados(ctx.msg);

    if (mencionado) {

        if (!ctx.ehAdm) {
            return ctx.responder('🔒 Só ADMs podem consultar o ID de outras pessoas.');
        }

        return ctx.responder(
            `🆔 ID de ${mencionar(mencionado)}:\n${mencionado}`,
            { mentions: [mencionado] }
        );

    }

    return ctx.responder(`🆔 Seu ID é:\n${ctx.idUsuario}`);

};

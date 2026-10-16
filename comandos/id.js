const { idsMencionados, mencionar } = require('../utils/identidade');


// Comando de ADM, fora do menu. Mostra o ID como ele aparece nesta
// conversa (em grupos costuma ser o @lid, que não expõe o telefone).
module.exports = async function id(ctx) {

    const [mencionado] = idsMencionados(ctx.msg);

    if (mencionado) {

        return ctx.responder(
            `🆔 ID de ${mencionar(mencionado)}:\n${mencionado}`,
            { mentions: [mencionado] }
        );

    }

    return ctx.responder(`🆔 Seu ID é:\n${ctx.idUsuario}`);

};

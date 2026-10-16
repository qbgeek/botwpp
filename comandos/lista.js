const { montarLista } = require('../utils/formatacao');


module.exports = async function lista(ctx) {

    return ctx.responder(montarLista(ctx.evento));

};

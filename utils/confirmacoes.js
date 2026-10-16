// Ações perigosas (limpar lista, encerrar evento) pedem confirmação.
// A confirmação vale só para o grupo onde foi pedida e expira sozinha.

const VALIDADE_MS = 2 * 60 * 1000;

const pendentes = new Map();


function solicitarConfirmacao(chatId, acao) {

    pendentes.set(chatId, {
        acao,
        expiraEm: Date.now() + VALIDADE_MS
    });

}


function confirmar(chatId, acao) {

    const pendente = pendentes.get(chatId);

    if (!pendente || pendente.acao !== acao || pendente.expiraEm < Date.now()) {
        return false;
    }

    pendentes.delete(chatId);

    return true;

}


module.exports = {
    solicitarConfirmacao,
    confirmar
};

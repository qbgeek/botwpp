// Ações que apagam dados (limpar, recomeçar ou excluir lista) pedem !confirmar.
// A confirmação vale só para o grupo onde foi pedida e expira sozinha.

const VALIDADE_MS = 2 * 60 * 1000;

const pendentes = new Map();


// pendente: { acao, chave, campos? }
function solicitarConfirmacao(chatId, pendente) {

    pendentes.set(chatId, {
        ...pendente,
        expiraEm: Date.now() + VALIDADE_MS
    });

}


function retirarConfirmacao(chatId) {

    const pendente = pendentes.get(chatId);

    pendentes.delete(chatId);

    if (!pendente || pendente.expiraEm < Date.now()) {
        return null;
    }

    return pendente;

}


module.exports = {
    solicitarConfirmacao,
    retirarConfirmacao
};

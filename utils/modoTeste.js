// =========================================================
// MODO TESTE
// Com a variável BOT_SOMENTE_GRUPO definida, o bot só responde
// nos grupos com esse nome e ignora todos os outros chats.
// Vários grupos: separe os nomes por vírgula.
//
//   PowerShell: $env:BOT_SOMENTE_GRUPO="Teste Bot QB"; npm.cmd start
//   cmd:        set BOT_SOMENTE_GRUPO=Teste Bot QB && npm start
// =========================================================

const normalizar = nome => (nome || '').trim().toLowerCase();

const GRUPOS_TESTE = (process.env.BOT_SOMENTE_GRUPO || '')
    .split(',')
    .map(normalizar)
    .filter(Boolean);

const ativo = GRUPOS_TESTE.length > 0;


// true = a mensagem deve ser ignorada (fora dos grupos de teste)
async function foraDoTeste(msg) {

    if (!ativo || !(msg.body || '').trim().startsWith('!')) {
        return false;
    }

    let chat;

    try {
        chat = await msg.getChat();
    } catch (erro) {
        return true;
    }

    if (chat.isGroup && GRUPOS_TESTE.includes(normalizar(chat.name))) {
        return false;
    }

    console.log(`🧪 Ignorado (fora do grupo de teste): "${chat.name || 'conversa privada'}" -> ${msg.body.split(/\s+/)[0]}`);

    return true;

}


module.exports = {
    ativo,
    GRUPOS_TESTE,
    foraDoTeste
};

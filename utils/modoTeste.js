// =========================================================
// MODO TESTE
// Com a variável BOT_SOMENTE_GRUPO definida, o bot só responde
// nos grupos com esse nome e ignora todos os outros chats.
// Vários grupos: separe os nomes por vírgula.
//
//   PowerShell: $env:BOT_SOMENTE_GRUPO="Teste Bot QB"; npm.cmd start
//   cmd:        set BOT_SOMENTE_GRUPO=Teste Bot QB && npm start
// =========================================================

const { idDoChat, lerChat } = require('./whatsapp');

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

    const comando = msg.body.trim().split(/\s+/)[0];

    console.log(`📩 Comando recebido: ${comando} (de ${msg.fromMe ? 'você' : msg.author || msg.from})`);

    const chat = await lerChat(msg.client, idDoChat(msg));

    if (!chat) {
        console.log(`⚠️ Chat de ${comando} não identificado; ignorado por segurança.`);
        return true;
    }

    if (chat.ehGrupo && GRUPOS_TESTE.includes(normalizar(chat.nome))) {
        console.log(`✅ Grupo de teste "${chat.nome}": processando ${comando}`);
        return false;
    }

    console.log(`🧪 Ignorado (fora do grupo de teste): "${chat.ehGrupo ? chat.nome : 'conversa privada'}" -> ${comando}`);

    return true;

}


module.exports = {
    ativo,
    GRUPOS_TESTE,
    foraDoTeste
};

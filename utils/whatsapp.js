// =========================================================
// LEITURA DIRETA DO CHAT
// O msg.getChat() do whatsapp-web.js 1.34.7 falha nas versões
// atuais do WhatsApp Web: ao montar o chat ele busca a última
// mensagem com uma função interna que mudou ("No key or key
// range specified"). Aqui lemos só o que o bot usa.
// =========================================================

function idDoChat(msg) {

    return msg.fromMe ? msg.to : msg.from;

}


// { nome, ehGrupo, participantes: [ids] } ou null se não conseguir ler
async function lerChat(client, chatId) {

    try {

        return await client.pupPage.evaluate((id) => {

            const wid = window.require('WAWebWidFactory').createWid(id);
            const chat = window.require('WAWebCollections').Chat.get(wid);

            if (!chat) {
                return null;
            }

            return {
                nome: chat.formattedTitle || chat.name || '',
                ehGrupo: Boolean(chat.groupMetadata),
                participantes: chat.groupMetadata
                    ? chat.groupMetadata.participants.getModelsArray().map(p => p.id._serialized)
                    : []
            };

        }, chatId);

    } catch (erro) {

        console.log(`⚠️ Não consegui ler o chat ${chatId}:`, erro.message);

        return null;

    }

}


module.exports = {
    idDoChat,
    lerChat
};

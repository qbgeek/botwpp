module.exports = async function todos(msg) {

    try {

        const chat = await msg.client.getChatById(msg.id.remote);

        const participantes = chat.groupMetadata.participants;


        const mencoes = participantes.map(
            p => p.id._serialized
        );


        await msg.reply(
            "🔔 Atenção, pessoal!",
            {
                mentions: mencoes
            }
        );


    } catch (erro) {

        console.log("❌ Erro no comando !todos:");
        console.log(erro);

        await msg.reply(
            "❌ Erro ao executar !todos."
        );

    }

};
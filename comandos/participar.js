module.exports = async function participar(msg, dados, salvarDados) {

    const idUsuario = msg.author || msg.from;

    const nome = msg.body.replace(/^!participar\s*/i, '').trim();

    if (dados.limiteVagas === 0) {
        return msg.reply('❌ Inscrições fechadas.');
    }

    if (!nome) {
        return msg.reply('❌ Digite seu nome!');
    }

    const jaInscrito =
        dados.inscritos.find(i => i.id === idUsuario) ||
        dados.listaEspera.find(i => i.id === idUsuario);

    if (jaInscrito) {
        return msg.reply('❌ Você já está na lista!');
    }

    const nomeExiste =
        dados.inscritos.find(i =>
            i.nome.toLowerCase() === nome.toLowerCase()
        ) ||
        dados.listaEspera.find(i =>
            i.nome.toLowerCase() === nome.toLowerCase()
        );

    if (nomeExiste) {
        return msg.reply(
            `❌ O nome *${nome}* já está na lista!`
        );
    }

    if (dados.inscritos.length < dados.limiteVagas) {

        dados.inscritos.push({
            nome,
            id: idUsuario
        });

        salvarDados(dados);

        const restam = dados.limiteVagas - dados.inscritos.length;

        return msg.reply(
            `✅ *${nome}* inscrito!\n\n` +
            `📋 Restam ${restam} vagas`
        );

    }

    if (dados.listaEspera.length < dados.limiteEspera) {

        dados.listaEspera.push({
            nome,
            id: idUsuario
        });

        salvarDados(dados);

        return msg.reply(
            `⏳ Vagas cheias!\n\n` +
            `*${nome}* foi para a fila de espera.\n\n` +
            `📋 Posição: ${dados.listaEspera.length}/${dados.limiteEspera}`
        );

    }

    return msg.reply(
        '🚫 Inscrições e fila de espera lotadas!'
    );

};
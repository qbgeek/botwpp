module.exports = async function sair(msg, dados, salvarDados) {

    const idUsuario = msg.author || msg.from;

    const indexPrincipal = dados.inscritos.findIndex(
        i => i.id === idUsuario
    );

    const indexEspera = dados.listaEspera.findIndex(
        i => i.id === idUsuario
    );

    if (indexPrincipal !== -1) {

        dados.inscritos.splice(indexPrincipal, 1);

        if (dados.listaEspera.length > 0) {

            const subiu = dados.listaEspera.shift();

            dados.inscritos.push(subiu);

            salvarDados(dados);

            return msg.reply(
                `🏃 Você saiu.\n\n` +
                `⬆️ *${subiu.nome}* saiu da fila de espera e entrou na lista principal!`
            );

        }

        salvarDados(dados);

        return msg.reply(
            "🏃 Você saiu da lista."
        );

    }

    if (indexEspera !== -1) {

        dados.listaEspera.splice(indexEspera, 1);

        salvarDados(dados);

        return msg.reply(
            "🏃 Você saiu da fila de espera."
        );

    }

    return msg.reply(
        "❓ Você não está na lista."
    );

};
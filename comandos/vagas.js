module.exports = async function(msg, dados, salvarDados) {


    const cmd = msg.body.toLowerCase();


    if (cmd.startsWith('!vagas ')) {


        const valor = parseInt(msg.body.split(' ')[1]);


        if (isNaN(valor)) {

            return msg.reply(
                '❌ Informe um número válido.\n\nExemplo:\n!vagas 20'
            );

        }


        if (valor <= 0) {

            return msg.reply(
                '❌ O número de vagas deve ser maior que zero.'
            );

        }


        if (valor < dados.inscritos.length) {

            return msg.reply(
                `❌ Existem ${dados.inscritos.length} jogadores inscritos.\n\n` +
                `Defina pelo menos ${dados.inscritos.length} vagas.`
            );

        }


        dados.limiteVagas = valor;

        salvarDados(dados);


        const restam = dados.limiteVagas - dados.inscritos.length;


        await msg.reply(
            `📏 Vagas definidas: *${dados.limiteVagas}*\n` +
            `📋 Restam: *${restam} vagas*`
        );

    }


    else if (cmd.startsWith('!espera ')) {


        const valor = parseInt(msg.body.split(' ')[1]);


        if (isNaN(valor)) {

            return msg.reply(
                '❌ Informe um número válido.\n\nExemplo:\n!espera 10'
            );

        }


        if (valor < 0) {

            return msg.reply(
                '❌ O limite da espera não pode ser negativo.'
            );

        }


        if (valor < dados.listaEspera.length) {

            return msg.reply(
                `❌ Existem ${dados.listaEspera.length} jogadores na fila de espera.\n\n` +
                `Defina pelo menos ${dados.listaEspera.length} vagas de espera.`
            );

        }


        dados.limiteEspera = valor;

        salvarDados(dados);


        await msg.reply(
            `⏳ Limite da fila de espera definido: *${dados.limiteEspera}*`
        );

    }

};
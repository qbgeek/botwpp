const { salvarDados } = require("../utils/dados");


module.exports = async function(msg, dados) {


    const cmd = msg.body.toLowerCase();


    if (cmd.startsWith('!premio1 ')) {


        const premio = msg.body.slice(9).trim();


        if (!premio) {

            return msg.reply(
                '❌ Use assim:\n!premio1 ETB Caos Ascendente'
            );

        }


        dados.premio1 = premio;

        salvarDados(dados);


        return msg.reply(
            `🥇 1º Lugar definido:\n${premio}`
        );

    }



    else if (cmd.startsWith('!premio2 ')) {


        const premio = msg.body.slice(9).trim();


        if (!premio) {

            return msg.reply(
                '❌ Use assim:\n!premio2 Quadri Pack Caos Ascendente'
            );

        }


        dados.premio2 = premio;

        salvarDados(dados);


        return msg.reply(
            `🥈 2º Lugar definido:\n${premio}`
        );

    }



    else if (cmd.startsWith('!premio3 ')) {


        const premio = msg.body.slice(9).trim();


        if (!premio) {

            return msg.reply(
                '❌ Use assim:\n!premio3 Triple Pack Caos Ascendente'
            );

        }


        dados.premio3 = premio;

        salvarDados(dados);


        return msg.reply(
            `🥉 3º Lugar definido:\n${premio}`
        );

    }



    else if (cmd === '!limparpremios') {


        dados.premio1 = "Não definido";
        dados.premio2 = "Não definido";
        dados.premio3 = "Não definido";


        salvarDados(dados);


        return msg.reply(
            "🗑️ Premiações especiais apagadas!"
        );

    }


};
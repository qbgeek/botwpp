module.exports = async function(msg, dados, salvarDados) {


    const cmd = msg.body.toLowerCase();


    if (cmd.startsWith('!setdata ')) {


        dados.dataCamp = msg.body.slice(9).trim();

        salvarDados(dados);


        await msg.reply(
            `✅ Data: *${dados.dataCamp}*`
        );


    }


    else if (cmd.startsWith('!sethora ')) {


        dados.horaCamp = msg.body.slice(9).trim();

        salvarDados(dados);


        await msg.reply(
            `✅ Horário: *${dados.horaCamp}*`
        );


    }


    else if (cmd.startsWith('!setvalor ')) {


        dados.valorEntrada = msg.body.slice(10).trim();

        salvarDados(dados);


        await msg.reply(
            `✅ Valor de entrada: *R$ ${dados.valorEntrada}*`
        );


    }

};
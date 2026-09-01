module.exports = async function(msg, dados, salvarDados) {

    const nome = msg.body.slice(5).trim();


    if (!nome) {
        return msg.reply(
            '❌ Digite um nome. Exemplo: !add João'
        );
    }


    const jaExiste = 
        dados.inscritos.find(i => 
            i.nome.toLowerCase() === nome.toLowerCase()
        ) ||
        dados.listaEspera.find(i => 
            i.nome.toLowerCase() === nome.toLowerCase()
        );


    if (jaExiste) {

        return msg.reply(
            `❌ ${nome} já está na lista!`
        );

    }


    if (dados.inscritos.length < dados.limiteVagas) {


        dados.inscritos.push({
            nome: nome,
            id: "ADM_" + Date.now()
        });


        salvarDados(dados);


        await msg.reply(
            `✅ ${nome} foi adicionado aos inscritos!`
        );


    } else if (dados.listaEspera.length < dados.limiteEspera) {


        dados.listaEspera.push({
            nome: nome,
            id: "ADM_" + Date.now()
        });


        salvarDados(dados);


        await msg.reply(
            `⏳ ${nome} foi adicionado à fila de espera!`
        );


    } else {


        await msg.reply(
`🚫 Não foi possível adicionar *${nome}*.

🏆 Inscritos: ${dados.inscritos.length}/${dados.limiteVagas}
⏳ Espera: ${dados.listaEspera.length}/${dados.limiteEspera}`
        );

    }

};
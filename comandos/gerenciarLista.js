const { salvarDados } = require("../utils/dados");


module.exports = async function(msg, dados) {


    const cmd = msg.body.toLowerCase();



    if (cmd.startsWith('!alterar ')) {


        const partes = msg.body.split(' ');

        const numero = parseInt(partes[1]);

        const novoNome = partes.slice(2).join(' ').trim();


        if (!numero || !novoNome) {

            return msg.reply(
                '❌ Use assim:\n!alterar número nome'
            );

        }


        const indice = numero - 1;


        if (indice < 0 || indice >= dados.inscritos.length) {

            return msg.reply(
                '❌ Número inválido.'
            );

        }


        const nomeAntigo = dados.inscritos[indice].nome;


        dados.inscritos[indice].nome = novoNome;


        salvarDados(dados);


        return msg.reply(
            `✅ Alterado!\nAntes: ${nomeAntigo}\nAgora: ${novoNome}`
        );

    }



    else if (cmd.startsWith('!remover ')) {


        if (dados.inscritos.length === 0) {

            return msg.reply(
                '❌ Não existem jogadores inscritos para remover.'
            );

        }



        const numero = parseInt(msg.body.split(' ')[1]);



        if (isNaN(numero)) {

            return msg.reply(
                '❌ Informe um número válido.\n\nExemplo:\n!remover 3'
            );

        }



        const index = numero - 1;



        if (index < 0 || index >= dados.inscritos.length) {

            return msg.reply(
                '❌ Jogador não encontrado.\n\nUse !lista para conferir os números.'
            );

        }



        const removido = dados.inscritos.splice(index, 1)[0];


        let mensagem =
            `🗑️ *${removido.nome}* foi removido da lista.`;



        if (dados.listaEspera.length > 0) {


            const primeiroEspera = dados.listaEspera.shift();


            dados.inscritos.push(primeiroEspera);


            mensagem +=
                `\n\n⬆️ *${primeiroEspera.nome}* subiu da fila de espera!`;

        }



        salvarDados(dados);


        return msg.reply(mensagem);

    }


};
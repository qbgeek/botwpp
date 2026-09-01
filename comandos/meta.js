const { salvarDados } = require("../utils/dados");

module.exports = async function(msg, dados) {

    const cmd = msg.body.toLowerCase();


    // META ADMIN
    if (cmd.startsWith('!meta ')) {

        const valor = parseInt(msg.body.split(' ')[1]);


        if (!valor) {
            return msg.reply('❌ Use assim: !meta 20');
        }


        dados.metaPremiacao = valor;

        salvarDados(dados);


        return msg.reply(
            `🔥 Meta definida: ${valor} jogadores`
        );

    }


    // META PÚBLICA
    if (cmd === '!meta') {

        const inscritos = dados.inscritos.length;
        const meta = dados.metaPremiacao;


        let texto = `🔥 *DESAFIO DA LIGA QB* 🔥\n\n`;


        if (meta === 0) {

            texto += `⏳ A meta de premiação ainda não foi definida pela organização.`;

            return msg.reply(texto);

        }


        texto += `👥 Participantes:\n`;
        texto += `*${inscritos}/${meta} jogadores*\n\n`;


        if (inscritos >= meta) {


            texto += `🎉 *META ATINGIDA!*\n\n`;
            texto += `🎁 *PREMIAÇÃO ESPECIAL:*\n\n`;
            texto += `🥇 1º Lugar: ${dados.premio1}\n`;
            texto += `🥈 2º Lugar: ${dados.premio2}\n`;
            texto += `🥉 3º Lugar: ${dados.premio3}`;


        } else {


            const faltam = meta - inscritos;


            texto += `🚀 Faltam apenas *${faltam} jogadores!*\n\n`;
            texto += `🔥 Mais jogadores = premiação melhor!\n\n`;

            texto += `🎁 *Premiação ao atingir a meta:*\n`;
            texto += `🥇 ${dados.premio1}\n`;
            texto += `🥈 ${dados.premio2}\n`;
            texto += `🥉 ${dados.premio3}`;

        }


        return msg.reply(texto);

    }

};
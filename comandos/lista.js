const gerarBarraMeta = require('../utils/barraMeta');

module.exports = async function lista(msg, dados) {

    let texto = `🏆 *LIGA QB!*\n\n`;
    texto += `🗓️:  ${dados.dataCamp}\n`;
    texto += `⏰:  ${dados.horaCamp}\n`;
    texto += `💰:  R$ ${dados.valorEntrada}\n`;
    texto += `🎁 *PREMIAÇÃO BASE:*\n`;
    texto += `Créditos em loja.\n\n`;

    if (dados.metaPremiacao > 0) {

        const inscritos = dados.inscritos.length;
        const meta = dados.metaPremiacao;

        const progresso = gerarBarraMeta(inscritos, meta);

        texto += `━━━━━━━━━━━━━━━━━━\n\n`;
        texto += `🔥 *META DA SEMANA* 🔥\n\n`;
        texto += `${progresso.barra}\n\n`;
        texto += `${progresso.porcentagem}%\n\n`;
        texto += `👥 ${inscritos}/${meta} jogadores\n\n`;

        if (inscritos >= meta) {
            texto += `🎉 *META ATINGIDA!*\n\n`;
        } else {
            texto += `🚀 Faltam apenas *${meta - inscritos}* jogadores!\n\n`;
        }

        texto += `🥇 ${dados.premio1}\n`;
        texto += `🥈 ${dados.premio2}\n`;
        texto += `🥉 ${dados.premio3}\n\n`;

        texto += `⚠️ A meta considera os jogadores presentes na QB GEEK.\n\n`;
    }

    texto += `📍: R. da Hora, 345 - Loja 14 - Espinheiro, Recife - PE, 52020-010\n`;
    texto += `------------------------------------------\n`;
    texto += `🏆 *LISTA DE INSCRITOS (${dados.inscritos.length}/${dados.limiteVagas})* 🏆\n\n`;

    if (dados.limiteVagas === 0) {

        texto += `_Aguardando ADMs definirem as vagas..._\n`;

    } else {

        for (let i = 0; i < dados.limiteVagas; i++) {
            texto += `${i + 1}. ${dados.inscritos[i] ? dados.inscritos[i].nome : "----"}\n`;
        }

    }

    if (dados.limiteEspera > 0) {

        texto += `\n⏳ *FILA DE ESPERA (${dados.listaEspera.length}/${dados.limiteEspera})*\n`;

        for (let i = 0; i < dados.limiteEspera; i++) {
            texto += `${i + 1}º. ${dados.listaEspera[i] ? dados.listaEspera[i].nome : "----"}\n`;
        }

    }

    await msg.reply(texto);

};
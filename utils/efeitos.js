const { mencionar } = require('./identidade');
const { linhasPremios } = require('./formatacao');


// Aviso de quem saiu da fila de espera, marcando a pessoa quando possível
function anunciarPromovidos(promovidos) {

    const linhas = [];
    const mencoes = [];

    for (const jogador of promovidos) {

        if (jogador.id) {

            linhas.push(`⬆️ ${mencionar(jogador.id)} (*${jogador.nome}*) saiu da fila de espera e garantiu a vaga! 🎉`);

            mencoes.push(jogador.id);

        } else {

            linhas.push(`⬆️ *${jogador.nome}* saiu da fila de espera e garantiu a vaga! 🎉`);

        }

    }

    return {
        texto: linhas.length ? `\n\n${linhas.join('\n')}` : '',
        mencoes
    };

}


// Mensagem extra de comemoração no momento exato em que a meta é batida
async function celebrarMeta(ctx, inscritosAntes) {

    const { evento } = ctx;

    const meta = evento.metaPremiacao;
    const agora = evento.inscritos.length;

    if (meta <= 0 || inscritosAntes >= meta || agora < meta) {
        return;
    }

    const texto = [
        `🎉🎊🎉 *META ATINGIDA!* 🎉🎊🎉`,
        '',
        `${evento.emoji} A *${evento.titulo}* chegou a *${meta} jogadores*!`,
        '',
        `🎁 *Premiação especial liberada:*`,
        ...linhasPremios(evento),
        '',
        `🔥 Bora pra cima!`
    ].join('\n');

    await ctx.client.sendMessage(ctx.chatId, texto);

}


module.exports = {
    anunciarPromovidos,
    celebrarMeta
};

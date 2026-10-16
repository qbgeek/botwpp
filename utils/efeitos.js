const { mencionar } = require('./identidade');


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


// Comemoração no momento exato em que a meta é batida.
// Vai junto na mesma resposta, sem mensagem extra.
function anunciarMeta(lista, inscritosAntes) {

    const meta = lista.metaPremiacao;

    if (meta <= 0 || inscritosAntes >= meta || lista.inscritos.length < meta) {
        return '';
    }

    return `\n\n🎉🎊 *META ATINGIDA!* A lista chegou a *${meta} jogadores* e a premiação especial foi liberada! 🥇🥈🥉`;

}


module.exports = {
    anunciarPromovidos,
    anunciarMeta
};

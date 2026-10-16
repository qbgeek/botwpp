// =========================================================
// TEXTO DA LISTA
// Segue o layout original da QB Geek, mostrando apenas até o
// último nome inscrito (sem as linhas "----" das vagas vazias).
// =========================================================

const gerarBarraMeta = require('./barraMeta');
const { LOJA } = require('./loja');


// plural(1, 'vaga', 'vagas') -> "1 vaga"
function plural(quantidade, singular, plural) {

    return `${quantidade} ${quantidade === 1 ? singular : plural}`;

}


function vagasRestantes(lista) {

    return Math.max(lista.limiteVagas - lista.inscritos.length, 0);

}


// "📋 Restam 10 vagas", usado logo após cada inscrição
function textoRestam(lista) {

    const restam = vagasRestantes(lista);

    if (restam === 0) {
        return '🔒 Essa foi a última vaga, lista completa!';
    }

    return `📋 ${restam === 1 ? 'Resta' : 'Restam'} ${plural(restam, 'vaga', 'vagas')}`;

}


function nomeNaLista(jogador) {

    return jogador.pago && !jogador.nome.includes('🆗')
        ? `${jogador.nome} 🆗`
        : jogador.nome;

}


function linhasPremios(lista) {

    return [
        `🥇 ${lista.premio1}`,
        `🥈 ${lista.premio2}`,
        `🥉 ${lista.premio3}`
    ];

}


function textoMeta(lista) {

    const inscritos = lista.inscritos.length;
    const meta = lista.metaPremiacao;

    const progresso = gerarBarraMeta(inscritos, meta);

    let texto = `━━━━━━━━━━━━━━━━━━\n\n`;
    texto += `🔥 *META DA SEMANA* 🔥\n\n`;
    texto += `${progresso.barra}\n\n`;
    texto += `${progresso.porcentagem}%\n\n`;
    texto += `👥 ${inscritos}/${meta} jogadores\n\n`;

    if (inscritos >= meta) {
        texto += `🎉 *META ATINGIDA!*\n\n`;
    } else {
        texto += `🚀 Faltam apenas *${plural(meta - inscritos, 'jogador', 'jogadores')}*!\n\n`;
    }

    texto += `${linhasPremios(lista).join('\n')}\n\n`;
    texto += `⚠️ A meta considera os jogadores presentes na ${LOJA.nome}.\n\n`;

    return texto;

}


function montarLista(lista) {

    const titulo = lista.titulo.endsWith('!') ? lista.titulo : `${lista.titulo}!`;

    let texto = `🏆 *${titulo}*\n\n`;
    texto += `🗓️:  ${lista.dataCamp}\n`;
    texto += `⏰:  ${lista.horaCamp}\n`;
    texto += `💰:  R$ ${lista.valorEntrada}\n`;
    texto += `🎁 *PREMIAÇÃO BASE:*\n`;
    texto += `${lista.premiacaoBase}\n\n`;

    if (lista.metaPremiacao > 0) {
        texto += textoMeta(lista);
    }

    texto += `📍: ${lista.local}\n`;
    texto += `------------------------------------------\n`;
    texto += `🏆 *LISTA DE INSCRITOS (${lista.inscritos.length}/${lista.limiteVagas})* 🏆\n\n`;

    if (lista.limiteVagas === 0) {

        texto += `_Aguardando ADMs definirem as vagas..._\n`;

    } else if (lista.inscritos.length === 0) {

        texto += `_Ninguém inscrito ainda. Seja o primeiro!_\n`;

    } else {

        lista.inscritos.forEach((jogador, i) => {
            texto += `${i + 1}. ${nomeNaLista(jogador)}\n`;
        });

    }

    if (lista.limiteEspera > 0) {

        texto += `\n⏳ *FILA DE ESPERA (${lista.listaEspera.length}/${lista.limiteEspera})*\n`;

        lista.listaEspera.forEach((jogador, i) => {
            texto += `${i + 1}º. ${nomeNaLista(jogador)}\n`;
        });

    }

    const temEspaco =
        lista.inscritos.length < lista.limiteVagas ||
        lista.listaEspera.length < lista.limiteEspera;

    if (temEspaco) {
        texto += `\n✍️ Para entrar: *!${lista.comando} Seu Nome*`;
    }

    return texto.trimEnd();

}


module.exports = {
    plural,
    vagasRestantes,
    textoRestam,
    linhasPremios,
    montarLista
};

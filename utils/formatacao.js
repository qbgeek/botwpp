const gerarBarraMeta = require('./barraMeta');
const { LOJA } = require('./tiposEvento');

const SEPARADOR = '━━━━━━━━━━━━━━━━━━';


// plural(1, 'vaga', 'vagas') -> "1 vaga"
function plural(quantidade, singular, plural) {

    return `${quantidade} ${quantidade === 1 ? singular : plural}`;

}


function linhasPremios(evento) {

    return [
        `🥇 ${evento.premio1}`,
        `🥈 ${evento.premio2}`,
        `🥉 ${evento.premio3}`
    ];

}


function linhasMeta(evento) {

    const inscritos = evento.inscritos.length;
    const meta = evento.metaPremiacao;

    const progresso = gerarBarraMeta(inscritos, meta);

    const linhas = [
        `🔥 *META DA SEMANA* 🔥`,
        '',
        `${progresso.barra}  *${progresso.porcentagem}%*`,
        `👥 ${inscritos}/${meta} jogadores`,
        ''
    ];

    if (inscritos >= meta) {
        linhas.push(`🎉 *META ATINGIDA! Premiação especial liberada!*`);
    } else {
        linhas.push(`🚀 Faltam apenas *${plural(meta - inscritos, 'jogador', 'jogadores')}*!`);
    }

    linhas.push(
        '',
        ...linhasPremios(evento),
        '',
        `_⚠️ A meta considera os jogadores presentes na ${LOJA.nome}._`
    );

    return linhas;

}


function linhasInscritos(evento) {

    const total = evento.inscritos.length;
    const limite = evento.limiteVagas;

    const linhas = [`📋 *INSCRITOS (${total}/${limite})*`, ''];

    if (limite === 0) {

        linhas.push('_Aguardando ADMs definirem as vagas..._');

        return linhas;

    }

    for (let i = 0; i < limite; i++) {

        const jogador = evento.inscritos[i];

        linhas.push(`${i + 1}. ${jogador ? jogador.nome : '_vaga livre_'}`);

    }

    linhas.push('');

    if (total >= limite) {

        linhas.push(
            evento.listaEspera.length < evento.limiteEspera
                ? '🔒 *Vagas esgotadas!* Novos inscritos vão para a fila de espera.'
                : '🔒 *Vagas esgotadas!*'
        );

    } else {

        linhas.push(`🟢 *${plural(limite - total, 'vaga disponível', 'vagas disponíveis')}*`);

    }

    return linhas;

}


function linhasEspera(evento) {

    const linhas = [`⏳ *FILA DE ESPERA (${evento.listaEspera.length}/${evento.limiteEspera})*`, ''];

    for (let i = 0; i < evento.limiteEspera; i++) {

        const jogador = evento.listaEspera[i];

        linhas.push(`${i + 1}º. ${jogador ? jogador.nome : '----'}`);

    }

    return linhas;

}


// A lista completa do evento, enviada após qualquer alteração
function montarLista(evento) {

    const linhas = [
        `${evento.emoji} *${evento.titulo}* ${evento.emoji}`,
        SEPARADOR,
        `🗓️ *Data:* ${evento.dataCamp}`,
        `⏰ *Horário:* ${evento.horaCamp}`,
        `💰 *Entrada:* R$ ${evento.valorEntrada}`,
        `🎁 *Premiação base:* ${evento.premiacaoBase}`,
        `📍 ${evento.local}`
    ];

    if (evento.metaPremiacao > 0) {
        linhas.push(SEPARADOR, ...linhasMeta(evento));
    }

    linhas.push(SEPARADOR, ...linhasInscritos(evento));

    if (evento.limiteEspera > 0) {
        linhas.push('', ...linhasEspera(evento));
    }

    const temEspaco =
        evento.inscritos.length < evento.limiteVagas ||
        evento.listaEspera.length < evento.limiteEspera;

    if (temEspaco) {
        linhas.push(SEPARADOR, '✍️ Para entrar: *!participar Seu Nome*');
    }

    return linhas.join('\n');

}


module.exports = {
    SEPARADOR,
    plural,
    montarLista,
    linhasPremios
};

const {
    criarEvento,
    removerEvento,
    listarEventos,
    lerLegado,
    marcarLegadoImportado
} = require('../utils/eventos');

const { TIPOS, TIPO_PERSONALIZADO, buscarTipo } = require('../utils/tiposEvento');
const { solicitarConfirmacao, confirmar } = require('../utils/confirmacoes');

const TAMANHO_MAXIMO_TITULO = 60;


async function nomeDoGrupo(ctx) {

    try {
        const chat = await ctx.msg.getChat();
        return chat.name || '';
    } catch (erro) {
        return '';
    }

}


// Valores iniciais a partir do tipo escolhido ou de um nome livre
function baseDoEvento(texto) {

    const tipo = buscarTipo(texto);

    if (tipo) {

        return {
            tipo: tipo.id,
            titulo: tipo.titulo,
            emoji: tipo.emoji,
            premiacaoBase: tipo.premiacaoBase
        };

    }

    return {
        tipo: 'outro',
        titulo: texto.toUpperCase().slice(0, TAMANHO_MAXIMO_TITULO),
        emoji: TIPO_PERSONALIZADO.emoji,
        premiacaoBase: TIPO_PERSONALIZADO.premiacaoBase
    };

}


function textoTiposDisponiveis() {

    const linhas = Object.entries(TIPOS).map(
        ([id, tipo]) => `${tipo.emoji} *!criarevento ${id}* — ${tipo.nome}`
    );

    linhas.push(`${TIPO_PERSONALIZADO.emoji} *!criarevento [nome livre]* — ex.: !criarevento Torneio de One Piece`);

    return linhas.join('\n');

}


async function criar(ctx) {

    if (ctx.evento) {

        return ctx.responder(
            `⚠️ Este grupo já tem um evento ativo: *${ctx.evento.titulo}*.\n\n` +
            `Para trocar, use *!encerrarevento* primeiro.`
        );

    }

    if (!ctx.args) {
        return ctx.responder(`🎉 *Qual evento você quer criar?*\n\n${textoTiposDisponiveis()}`);
    }

    ctx.evento = criarEvento(ctx.chatId, {
        ...baseDoEvento(ctx.args),
        grupo: await nomeDoGrupo(ctx)
    });

    await ctx.reagir('🎉');

    return ctx.responderComLista(
        `🎉 *Evento criado neste grupo!*\n\n` +
        `👑 Próximos passos (ADM):\n` +
        `• *!vagas [nº]* — abre as inscrições\n` +
        `• *!espera [nº]* — fila de espera\n` +
        `• *!setdata*, *!sethora*, *!setvalor*`
    );

}


async function encerrar(ctx) {

    solicitarConfirmacao(ctx.chatId, 'encerrar');

    return ctx.responder(
        `⚠️ *ATENÇÃO!*\n\n` +
        `Você está prestes a *encerrar* o evento *${ctx.evento.titulo}* deste grupo.\n` +
        `Todas as listas e configurações dele serão apagadas.\n\n` +
        `Para confirmar, digite em até 2 minutos:\n\n*!confirmarencerramento*`
    );

}


async function confirmarEncerramento(ctx) {

    if (!confirmar(ctx.chatId, 'encerrar')) {
        return ctx.responder('❌ Nenhum encerramento pendente (ou o prazo expirou). Use *!encerrarevento* primeiro.');
    }

    const { titulo, emoji } = ctx.evento;

    removerEvento(ctx.chatId);

    await ctx.reagir('🏁');

    return ctx.responder(
        `🏁 ${emoji} *${titulo}* foi encerrado.\n\n` +
        `Obrigado a todos que participaram! 🙌\n\n` +
        `ADM: para começar outro, use *!criarevento*.`
    );

}


async function listar(ctx) {

    const eventos = listarEventos();

    if (eventos.length === 0) {
        return ctx.responder('📅 Nenhum evento ativo no momento.');
    }

    const blocos = eventos.map(({ evento }) =>
        `${evento.emoji} *${evento.titulo}*\n` +
        `👥 Grupo: ${evento.grupo || '(sem nome)'}\n` +
        `🗓️ ${evento.dataCamp} ⏰ ${evento.horaCamp}\n` +
        `📋 ${evento.inscritos.length}/${evento.limiteVagas} inscritos · ⏳ ${evento.listaEspera.length}/${evento.limiteEspera} na espera`
    );

    return ctx.responder(`📅 *EVENTOS ATIVOS (${eventos.length})*\n\n${blocos.join('\n\n')}`);

}


const CAMPOS_LEGADO = [
    'dataCamp',
    'horaCamp',
    'valorEntrada',
    'limiteVagas',
    'limiteEspera',
    'metaPremiacao',
    'premio1',
    'premio2',
    'premio3',
    'inscritos',
    'listaEspera'
];


async function importarLegado(ctx) {

    const legado = lerLegado();

    if (!legado) {
        return ctx.responder('❌ Não há dados da versão antiga (dados_campeonato.json) para importar.');
    }

    if (ctx.evento) {
        return ctx.responder('⚠️ Este grupo já tem um evento. Use *!encerrarevento* antes de importar.');
    }

    // Sem tipo informado, mantém o nome que a versão antiga usava
    const base = ctx.args
        ? baseDoEvento(ctx.args)
        : { tipo: 'outro', titulo: 'LIGA QB', emoji: '🏆' };

    const camposAntigos = {};

    for (const campo of CAMPOS_LEGADO) {

        if (legado[campo] !== undefined) {
            camposAntigos[campo] = legado[campo];
        }

    }

    ctx.evento = criarEvento(ctx.chatId, {
        ...base,
        ...camposAntigos,
        grupo: await nomeDoGrupo(ctx)
    });

    marcarLegadoImportado();

    await ctx.reagir('📦');

    return ctx.responderComLista(
        `📦 *Dados antigos importados!*\n\n` +
        `${ctx.evento.inscritos.length} inscritos e ${ctx.evento.listaEspera.length} na espera vieram da versão anterior.\n\n` +
        `💡 Quem foi adicionado por ADM pode enviar *!eusou [nº]* para conseguir sair sozinho depois.`
    );

}


module.exports = {
    criar,
    encerrar,
    confirmarEncerramento,
    listar,
    importarLegado
};

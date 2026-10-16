const {
    limparNome,
    nomeEmUso,
    encontrarJogador,
    adicionarJogador,
    descreverPosicao
} = require('../utils/listas');

const {
    resolverIds,
    idsMencionados,
    mencionar,
    nomeDoContato
} = require('../utils/identidade');

const { textoRestam } = require('../utils/formatacao');
const { anunciarMeta } = require('../utils/efeitos');


// !add Nome          -> vaga criada pelo ADM (só um ADM remove)
// !add @pessoa       -> vaga vinculada à pessoa, usa o nome do perfil
// !add @pessoa Nome  -> vaga vinculada com o nome escolhido
module.exports = async function add(ctx) {

    const { lista, client } = ctx;

    const [mencionado] = idsMencionados(ctx.msg);

    const ids = mencionado ? await resolverIds(client, mencionado) : [];

    if (mencionado) {

        const jaNaLista = encontrarJogador(lista, ids);

        if (jaNaLista) {

            return ctx.responder(
                `❌ Essa pessoa já está na lista como *${jaNaLista.jogador.nome}* ` +
                `(${descreverPosicao(jaNaLista.parte, jaNaLista.indice)}).`
            );

        }

    }

    const nome =
        limparNome(ctx.args) ||
        (mencionado ? limparNome(await nomeDoContato(client, mencionado)) : '');

    if (!nome) {
        return ctx.responder('❌ Digite um nome ou marque a pessoa.\n\nExemplos:\n!add João\n!add @João');
    }

    if (nomeEmUso(lista, nome)) {
        return ctx.responder(`❌ ${nome} já está na lista!`);
    }

    const inscritosAntes = lista.inscritos.length;

    const destino = adicionarJogador(lista, {
        nome,
        id: mencionado || null,
        ids,
        pago: false,
        adicionadoPorAdm: true
    });

    if (!destino) {

        return ctx.responder(
            `🚫 Não foi possível adicionar *${nome}*.\n\n` +
            `🏆 Inscritos: ${lista.inscritos.length}/${lista.limiteVagas}\n` +
            `⏳ Espera: ${lista.listaEspera.length}/${lista.limiteEspera}`
        );

    }

    ctx.salvar();

    const quem = mencionado ? `${mencionar(mencionado)} (*${nome}*)` : `*${nome}*`;
    const mencoes = mencionado ? [mencionado] : [];

    if (destino === 'inscritos') {

        await ctx.reagir('✅');

        return ctx.responderComLista(
            `✅ ${quem} foi adicionado aos inscritos!\n\n${textoRestam(lista)}${anunciarMeta(lista, inscritosAntes)}`,
            mencoes
        );

    }

    await ctx.reagir('⏳');

    return ctx.responderComLista(`⏳ ${quem} foi adicionado à fila de espera!`, mencoes);

};

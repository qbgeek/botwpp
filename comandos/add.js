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

const { celebrarMeta } = require('../utils/efeitos');


// !add Nome          -> vaga sem dono (a pessoa pode usar !eusou depois)
// !add @pessoa       -> vaga já vinculada, usa o nome do perfil
// !add @pessoa Nome  -> vaga vinculada com o nome escolhido
module.exports = async function add(ctx) {

    const { evento, client } = ctx;

    const [mencionado] = idsMencionados(ctx.msg);

    const ids = mencionado ? await resolverIds(client, mencionado) : [];

    if (mencionado) {

        const jaNaLista = encontrarJogador(evento, ids);

        if (jaNaLista) {

            return ctx.responder(
                `❌ Essa pessoa já está na lista como *${jaNaLista.jogador.nome}* ` +
                `(${descreverPosicao(jaNaLista.lista, jaNaLista.indice)}).`
            );

        }

    }

    const nome =
        limparNome(ctx.args) ||
        (mencionado ? limparNome(await nomeDoContato(client, mencionado)) : '');

    if (!nome) {
        return ctx.responder('❌ Digite um nome ou marque a pessoa.\n\nExemplos:\n!add João\n!add @João');
    }

    if (nomeEmUso(evento, nome)) {
        return ctx.responder(`❌ *${nome}* já está na lista!`);
    }

    const inscritosAntes = evento.inscritos.length;

    const destino = adicionarJogador(evento, {
        nome,
        id: mencionado || null,
        ids
    });

    if (!destino) {

        return ctx.responder(
            `🚫 Não foi possível adicionar *${nome}*.\n\n` +
            `📋 Inscritos: ${evento.inscritos.length}/${evento.limiteVagas}\n` +
            `⏳ Espera: ${evento.listaEspera.length}/${evento.limiteEspera}`
        );

    }

    ctx.salvar();

    await ctx.reagir(destino === 'inscritos' ? '✅' : '⏳');

    const lista = evento[destino];
    const posicao = descreverPosicao(destino, lista.length - 1);

    const quem = mencionado ? `${mencionar(mencionado)} (*${nome}*)` : `*${nome}*`;

    let cabecalho = `➕ ${quem} foi adicionado(a) por um ADM — ${posicao}.`;

    if (!mencionado) {

        const codigo = destino === 'inscritos' ? lista.length : `e${lista.length}`;

        cabecalho += `\n\n💡 *${nome}*, para poder sair sozinho(a) depois, envie *!eusou ${codigo}*.`;

    }

    await ctx.responderComLista(cabecalho, mencionado ? [mencionado] : []);

    await celebrarMeta(ctx, inscritosAntes);

};

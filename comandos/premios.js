const TAMANHO_MAXIMO = 120;

const POSICOES = {
    '!premio1': { campo: 'premio1', medalha: '🥇', lugar: '1º Lugar', exemplo: '!premio1 ETB Caos Ascendente' },
    '!premio2': { campo: 'premio2', medalha: '🥈', lugar: '2º Lugar', exemplo: '!premio2 Quadri Pack Caos Ascendente' },
    '!premio3': { campo: 'premio3', medalha: '🥉', lugar: '3º Lugar', exemplo: '!premio3 Triple Pack Caos Ascendente' }
};


async function definir(ctx) {

    const { campo, medalha, lugar, exemplo } = POSICOES[ctx.nome];

    const premio = ctx.args.slice(0, TAMANHO_MAXIMO);

    if (!premio) {
        return ctx.responder(`❌ Use assim:\n${exemplo}`);
    }

    ctx.evento[campo] = premio;

    ctx.salvar();

    await ctx.reagir(medalha);

    return ctx.responderComLista(`${medalha} ${lugar} definido: *${premio}*`);

}


async function limpar(ctx) {

    ctx.evento.premio1 = 'Não definido';
    ctx.evento.premio2 = 'Não definido';
    ctx.evento.premio3 = 'Não definido';

    ctx.salvar();

    await ctx.reagir('🧹');

    return ctx.responderComLista('🧹 Premiações especiais apagadas!');

}


module.exports = {
    definir,
    limpar
};

const TAMANHO_MAXIMO = 120;

// Todos os campos de texto do evento seguem o mesmo fluxo
const CAMPOS = {
    '!settitulo': { campo: 'titulo', rotulo: '🏷️ Título', exemplo: '!settitulo LIGA MAGIC QB' },
    '!setdata': { campo: 'dataCamp', rotulo: '🗓️ Data', exemplo: '!setdata 01/09/2026' },
    '!sethora': { campo: 'horaCamp', rotulo: '⏰ Horário', exemplo: '!sethora 18h30' },
    '!setvalor': { campo: 'valorEntrada', rotulo: '💰 Valor de entrada', exemplo: '!setvalor 20,00' },
    '!setlocal': { campo: 'local', rotulo: '📍 Local', exemplo: '!setlocal R. da Hora, 345' },
    '!setbase': { campo: 'premiacaoBase', rotulo: '🎁 Premiação base', exemplo: '!setbase Créditos em loja.' }
};


async function configuracao(ctx) {

    const { campo, rotulo, exemplo } = CAMPOS[ctx.nome];

    let valor = ctx.args.slice(0, TAMANHO_MAXIMO);

    if (campo === 'valorEntrada') {
        valor = valor.replace(/^r\$\s*/i, '');
    }

    if (!valor) {
        return ctx.responder(`❌ Informe o valor.\n\nExemplo:\n${exemplo}`);
    }

    ctx.evento[campo] = valor;

    ctx.salvar();

    await ctx.reagir('✅');

    return ctx.responderComLista(`✅ ${rotulo}: *${valor}*`);

}


configuracao.COMANDOS = Object.keys(CAMPOS);

module.exports = configuracao;

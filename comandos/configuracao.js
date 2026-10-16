const TAMANHO_MAXIMO = 120;

// Todos os campos de texto da lista seguem o mesmo fluxo.
// Configuração responde numa linha só; a lista completa aparece quando muda gente.
const CAMPOS = {
    '!settitulo': { campo: 'titulo', rotulo: 'Título', exemplo: '!settitulo LIGA QB' },
    '!setdata': { campo: 'dataCamp', rotulo: 'Data', exemplo: '!setdata 30/10/2026' },
    '!sethora': { campo: 'horaCamp', rotulo: 'Horário', exemplo: '!sethora 18h30' },
    '!setvalor': { campo: 'valorEntrada', rotulo: 'Valor de entrada', exemplo: '!setvalor 20,00', prefixo: 'R$ ' },
    '!setlocal': { campo: 'local', rotulo: 'Local', exemplo: '!setlocal R. da Hora, 345' },
    '!setbase': { campo: 'premiacaoBase', rotulo: 'Premiação base', exemplo: '!setbase Créditos em loja.' }
};


async function configuracao(ctx) {

    const { campo, rotulo, exemplo, prefixo = '' } = CAMPOS[ctx.nome];

    let valor = ctx.args.slice(0, TAMANHO_MAXIMO);

    if (campo === 'valorEntrada') {
        valor = valor.replace(/^r\$\s*/i, '');
    }

    if (!valor) {
        return ctx.responder(`❌ Informe o valor.\n\nExemplo:\n${exemplo}`);
    }

    ctx.lista[campo] = valor;

    ctx.salvar();

    await ctx.reagir('✅');

    return ctx.responder(`✅ ${rotulo} (*${ctx.lista.comando}*): *${prefixo}${valor}*`);

}


configuracao.COMANDOS = Object.keys(CAMPOS);

module.exports = configuracao;

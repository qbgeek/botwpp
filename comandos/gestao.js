const {
    normalizarChave,
    obterLista,
    criarLista,
    removerLista,
    todasAsListas,
    lerLegado,
    marcarLegadoImportado
} = require('../utils/armazenamento');

const { limparLista } = require('../utils/listas');
const { montarLista, plural } = require('../utils/formatacao');
const { solicitarConfirmacao, retirarConfirmacao } = require('../utils/confirmacoes');
const { lerChat } = require('../utils/whatsapp');

const TAMANHO_MAXIMO_NOME = 20;

const EXEMPLO_CRIAR = '*!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00*';

const EXPLICACAO_CRIAR =
    `${EXEMPLO_CRIAR}\n` +
    `_(data, hora, vagas, reservas e valor; o valor é opcional e aceita espaços)_`;


// Grupo onde a lista está sendo criada (vazio se for no privado)
async function origem(ctx) {

    if (!ctx.ehGrupo) {
        return {};
    }

    const chat = await lerChat(ctx.client, ctx.chatId);

    return { chatId: ctx.chatId, nomeGrupo: chat ? chat.nome : '' };

}


// "30/10/2026 18h30 24 12 R$ 35,00 MASTERS" -> campos da lista
function lerParametros(texto) {

    const partes = /^(\S+)\s+(\S+)\s+(\d+)\s+(\d+)\s*([\s\S]*)$/.exec(texto);

    if (!partes) {
        return null;
    }

    const [, data, hora, vagas, reservas, valor] = partes;

    if (Number(vagas) <= 0) {
        return null;
    }

    const campos = {
        dataCamp: data,
        horaCamp: hora,
        limiteVagas: Number(vagas),
        limiteEspera: Number(reservas)
    };

    const valorLimpo = valor.trim().replace(/^r\$\s*/i, '');

    if (valorLimpo) {
        campos.valorEntrada = valorLimpo;
    }

    return campos;

}


function validarNome(ctx, comando) {

    const chave = normalizarChave(comando);

    if (!/^[a-z][a-z0-9]*$/.test(chave)) {
        return '❌ O nome da lista precisa começar com uma letra e ter só letras e números.\n\nExemplo: *!lista #ygo*';
    }

    if (chave.length > TAMANHO_MAXIMO_NOME) {
        return `❌ Nome muito longo (máximo ${TAMANHO_MAXIMO_NOME} letras).`;
    }

    if (ctx.comandoExiste(chave) || ctx.comandoExiste(comando)) {
        return `❌ *!${comando}* já é um comando do bot. Escolha outro nome.`;
    }

    return null;

}


function resumoCampos(campos) {

    let texto = `🗓️ ${campos.dataCamp}  ⏰ ${campos.horaCamp}\n`;
    texto += `📏 ${plural(campos.limiteVagas, 'vaga', 'vagas')}  ⏳ ${plural(campos.limiteEspera, 'reserva', 'reservas')}`;

    if (campos.valorEntrada) {
        texto += `\n💰 R$ ${campos.valorEntrada}`;
    }

    return texto;

}


// !lista                -> mostra a lista (ou o resumo, se houver várias)
// !lista #ygo           -> mostra a lista; cria vazia se não existir
// !lista #ygo <dados>   -> cria já configurada, ou recomeça (pede !confirmar)
async function lista(ctx) {

    const [primeira] = ctx.args.split(/\s+/, 1);

    if (!primeira) {

        const listas = todasAsListas();

        if (listas.length === 1) {
            return ctx.responder(montarLista(listas[0]));
        }

        if (listas.length === 0) {
            return ctx.responder(`📋 Ainda não existe nenhuma lista. Crie com:\n\n${EXPLICACAO_CRIAR}`);
        }

        return listar(ctx);

    }

    const comando = primeira.replace(/^#/, '').toLowerCase();
    const chave = normalizarChave(comando);
    const resto = ctx.args.slice(primeira.length).trim();

    const existente = obterLista(chave);

    if (!resto) {

        if (existente) {
            return ctx.responder(montarLista(existente));
        }

        const erroNome = validarNome(ctx, comando);

        if (erroNome) {
            return ctx.responder(erroNome);
        }

        ctx.lista = criarLista(comando, {}, await origem(ctx));

        await ctx.reagir('🆕');

        return ctx.responder(
            `🆕 Lista *${ctx.lista.titulo}* criada!\n\n` +
            `Para configurar tudo de uma vez:\n${EXPLICACAO_CRIAR.replace('#ygo', `#${comando}`)}\n\n` +
            `A galera entra com *!${comando} Nome*, em qualquer grupo do bot.`
        );

    }

    const campos = lerParametros(resto);

    if (!campos) {
        return ctx.responder(`❌ Não entendi os dados. Use assim:\n\n${EXPLICACAO_CRIAR}`);
    }

    if (!existente) {

        const erroNome = validarNome(ctx, comando);

        if (erroNome) {
            return ctx.responder(erroNome);
        }

        ctx.lista = criarLista(comando, campos, await origem(ctx));

        await ctx.reagir('🆕');

        return ctx.responderComLista(`🆕 Lista criada! A galera entra com *!${comando} Nome*.`);

    }

    solicitarConfirmacao(ctx.chatId, { acao: 'recomecar', chave, campos });

    return ctx.responder(
        `⚠️ A lista *${existente.titulo}* já existe e tem ` +
        `${plural(existente.inscritos.length, 'inscrito', 'inscritos')}.\n\n` +
        `Vou *zerar os inscritos* e abrir uma nova edição com:\n${resumoCampos(campos)}\n\n` +
        `Para confirmar, digite em até 2 minutos:\n\n*!confirmar*`
    );

}


// Todas as listas abertas (valem para todos os grupos)
async function listar(ctx) {

    const itens = todasAsListas();

    if (itens.length === 0) {
        return ctx.responder('📚 Nenhuma lista aberta no momento.');
    }

    const blocos = itens.map(lista => {

        const pagos = lista.inscritos.filter(j => j.pago).length;

        let bloco = `🏆 *${lista.titulo}* — *!${lista.comando}*\n`;

        if (lista.nomeGrupoOrigem) {
            bloco += `👥 Criada em: ${lista.nomeGrupoOrigem}\n`;
        }

        bloco += `🗓️ ${lista.dataCamp}  ⏰ ${lista.horaCamp}\n`;
        bloco += `📋 ${lista.inscritos.length}/${lista.limiteVagas} inscritos · ⏳ ${lista.listaEspera.length}/${lista.limiteEspera} reservas · 🆗 ${pagos} pagos`;

        return bloco;

    });

    return ctx.responder(`📚 *LISTAS ABERTAS (${itens.length})*\n\n${blocos.join('\n\n')}`);

}


async function limpar(ctx) {

    solicitarConfirmacao(ctx.chatId, { acao: 'limpar', chave: ctx.lista.chave });

    return ctx.responder(
`⚠️ *ATENÇÃO!*

Você está prestes a limpar a lista *${ctx.lista.titulo}*.

Serão apagados:

🗑️ Lista de inscritos
🗑️ Lista de espera
🗑️ Data e horário
🗑️ Meta de jogadores
🗑️ Premiações especiais

Serão mantidos:

✅ Valor da inscrição
✅ Quantidade de vagas e reservas

Para confirmar, digite em até 2 minutos:

*!confirmar*`
    );

}


async function excluir(ctx) {

    solicitarConfirmacao(ctx.chatId, { acao: 'excluir', chave: ctx.lista.chave });

    return ctx.responder(
        `⚠️ *ATENÇÃO!*\n\n` +
        `Você está prestes a *excluir* a lista *${ctx.lista.titulo}*.\n` +
        `O comando *!${ctx.lista.comando}* deixa de funcionar e todos os inscritos são apagados.\n\n` +
        `Para confirmar, digite em até 2 minutos:\n\n*!confirmar*`
    );

}


async function confirmar(ctx) {

    const pendente = retirarConfirmacao(ctx.chatId);

    if (!pendente) {
        return ctx.responder('❌ Nada para confirmar (ou o prazo de 2 minutos expirou).');
    }

    ctx.lista = obterLista(pendente.chave);

    if (!ctx.lista) {
        return ctx.responder('❌ Essa lista não existe mais.');
    }

    if (pendente.acao === 'excluir') {

        const { titulo, comando } = ctx.lista;

        removerLista(pendente.chave);

        await ctx.reagir('🏁');

        return ctx.responder(`🏁 Lista *${titulo}* excluída. O comando *!${comando}* não funciona mais.`);

    }

    limparLista(ctx.lista);

    if (pendente.acao === 'recomecar') {
        Object.assign(ctx.lista, pendente.campos);
    }

    ctx.salvar();

    await ctx.reagir('🧹');

    return ctx.responderComLista(
        pendente.acao === 'recomecar'
            ? `🔄 *Nova edição aberta!* Bora encher essa lista! 🚀`
            : `🧹 *Lista reiniciada com sucesso!* Novo campeonato pronto!`
    );

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


// O 🆗 que era digitado no nome vira a marcação de pago
function converterJogadorLegado(jogador) {

    const pago = jogador.nome.includes('🆗');

    return {
        ...jogador,
        nome: pago ? jogador.nome.replace(/\s*🆗\s*/g, ' ').trim() : jogador.nome,
        pago
    };

}


// !importarlegado #ygo -> traz a lista da versão antiga para uma lista nova
async function importarLegado(ctx) {

    const [primeira] = ctx.args.split(/\s+/, 1);

    if (!primeira) {
        return ctx.responder('❌ Informe o nome da lista.\n\nExemplo: *!importarlegado #ygo*');
    }

    const comando = primeira.replace(/^#/, '').toLowerCase();

    const legado = lerLegado();

    if (!legado) {
        return ctx.responder('❌ Não há dados da versão antiga (dados_campeonato.json) para importar.');
    }

    if (obterLista(normalizarChave(comando))) {
        return ctx.responder(`⚠️ A lista *!${comando}* já existe. Escolha outro nome.`);
    }

    const erroNome = validarNome(ctx, comando);

    if (erroNome) {
        return ctx.responder(erroNome);
    }

    const campos = { titulo: 'LIGA QB' };

    for (const campo of CAMPOS_LEGADO) {

        if (legado[campo] !== undefined) {
            campos[campo] = legado[campo];
        }

    }

    campos.inscritos = (campos.inscritos || []).map(converterJogadorLegado);
    campos.listaEspera = (campos.listaEspera || []).map(converterJogadorLegado);

    ctx.lista = criarLista(comando, campos, await origem(ctx));

    marcarLegadoImportado();

    await ctx.reagir('📦');

    return ctx.responderComLista(
        `📦 *Lista antiga importada!*\n` +
        `${plural(ctx.lista.inscritos.length, 'inscrito veio', 'inscritos vieram')} da versão anterior. ` +
        `A galera agora entra com *!${comando} Nome*.`
    );

}


module.exports = {
    lista,
    listar,
    limpar,
    excluir,
    confirmar,
    importarLegado
};

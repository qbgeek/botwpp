const ajuda = require('./ajuda');
const id = require('./id');
const admins = require('./admins');
const gestao = require('./gestao');
const participar = require('./participar');
const sair = require('./sair');
const add = require('./add');
const gerenciarLista = require('./gerenciarLista');
const configuracao = require('./configuracao');
const vagas = require('./vagas');
const meta = require('./meta');
const premios = require('./premios');
const todos = require('./todos');

const {
    normalizarChave,
    todasAsListas,
    obterLista,
    salvarListas
} = require('../utils/armazenamento');

const { ehAdmin } = require('../utils/config');
const { resolverIds } = require('../utils/identidade');
const { montarLista } = require('../utils/formatacao');


// =========================================================
// TABELA DE COMANDOS
// escopo:
//   global -> funciona em qualquer conversa (grupo ou privado)
//   grupo  -> só dentro de grupos
//   lista  -> precisa de uma lista; ela é o 1º argumento (veja resolverLista)
// admin: true -> exclusivo para ADMs (checado AQUI, antes de executar)
//
// As listas são globais e viram comandos sozinhas: a lista "ygo"
// responde a "!ygo Nome" em qualquer grupo (veja o final de executarComando).
// =========================================================

const COMANDOS = [

    // --- Públicos ---
    { nomes: ['!neymar', '!ajudaney'], escopo: 'global', executar: ajuda },
    { nomes: ['!sair'], escopo: 'global', executar: sair },
    // "!meta" é público; "!meta N" é verificado como ADM dentro do comando
    { nomes: ['!meta'], escopo: 'lista', executar: meta },

    // --- ADM: listas ---
    // "!lista" sem permissão só recebe uma reação, para não virar spam
    { nomes: ['!lista'], escopo: 'global', admin: true, negarComReacao: true, executar: gestao.lista },
    { nomes: ['!listas'], escopo: 'global', admin: true, executar: gestao.listar },
    { nomes: ['!limparlista'], escopo: 'lista', admin: true, executar: gestao.limpar },
    { nomes: ['!excluirlista'], escopo: 'lista', admin: true, executar: gestao.excluir },
    { nomes: ['!confirmar', '!confirmarlimpeza'], escopo: 'global', admin: true, executar: gestao.confirmar },
    { nomes: ['!importarlegado'], escopo: 'global', admin: true, executar: gestao.importarLegado },
    { nomes: ['!todos'], escopo: 'grupo', admin: true, executar: todos },

    // --- ADM: configuração da lista ---
    { nomes: configuracao.COMANDOS, escopo: 'lista', admin: true, executar: configuracao },
    { nomes: ['!vagas'], escopo: 'lista', admin: true, executar: vagas.vagas },
    { nomes: ['!espera'], escopo: 'lista', admin: true, executar: vagas.espera },
    { nomes: ['!premio1', '!premio2', '!premio3'], escopo: 'lista', admin: true, executar: premios.definir },
    { nomes: ['!limparpremios'], escopo: 'lista', admin: true, executar: premios.limpar },

    // --- ADM: jogadores ---
    { nomes: ['!add'], escopo: 'lista', admin: true, executar: add },
    { nomes: ['!pago'], escopo: 'lista', admin: true, executar: gerenciarLista.pago },
    { nomes: ['!naopago'], escopo: 'lista', admin: true, executar: gerenciarLista.naoPago },
    { nomes: ['!alterar'], escopo: 'lista', admin: true, executar: gerenciarLista.alterar },
    { nomes: ['!remover'], escopo: 'lista', admin: true, executar: gerenciarLista.remover },
    { nomes: ['!vincular'], escopo: 'lista', admin: true, executar: gerenciarLista.vincular },

    // --- ADM: permissões ---
    { nomes: ['!id'], escopo: 'global', admin: true, executar: id },
    { nomes: ['!admins'], escopo: 'global', admin: true, executar: admins.listar },
    { nomes: ['!addadm'], escopo: 'global', admin: true, executar: admins.adicionar },
    { nomes: ['!deladm'], escopo: 'global', admin: true, executar: admins.remover }

];

const MAPA = new Map();

for (const comando of COMANDOS) {
    comando.nomes.forEach(nome => MAPA.set(nome, comando));
}


// Impede criar uma lista com o nome de um comando do bot
function comandoExiste(nome) {

    return MAPA.has(`!${nome}`);

}


// Descobre a lista pelo 1º argumento ("ygo" ou "#ygo"). Sem o nome:
//   - se só existe uma lista, usa ela;
//   - senão, se só uma lista foi criada neste grupo, usa ela.
function resolverLista(chatId, args) {

    const [primeira] = args.split(/\s+/, 1);

    const pelaPrimeira = primeira ? obterLista(normalizarChave(primeira)) : null;

    if (pelaPrimeira) {
        return { lista: pelaPrimeira, args: args.slice(primeira.length).trim() };
    }

    const listas = todasAsListas();

    if (listas.length === 1) {
        return { lista: listas[0], args };
    }

    const doGrupo = listas.filter(l => l.grupoOrigem === chatId);

    if (doGrupo.length === 1) {
        return { lista: doGrupo[0], args };
    }

    return { lista: null, listas };

}


function criarContexto(msg, client, dados) {

    const ctx = {
        msg,
        client,
        ...dados,

        comandoExiste,
        salvar: salvarListas,

        responder(texto, opcoes = {}) {
            return msg.reply(texto, undefined, opcoes);
        },

        // Mudou alguém na lista -> responde com a lista atualizada
        responderComLista(cabecalho, mencoes = []) {
            return msg.reply(
                `${cabecalho}\n\n${montarLista(ctx.lista)}`,
                undefined,
                { mentions: mencoes }
            );
        },

        async reagir(emoji) {
            try {
                await msg.react(emoji);
            } catch (erro) {
                // Reação é só enfeite; não interrompe o comando
            }
        }
    };

    return ctx;

}


module.exports = async function executarComando(msg, client) {

    const texto = (msg.body || '').trim();

    if (!texto.startsWith('!')) {
        return;
    }

    const [palavra] = texto.split(/\s+/, 1);
    const nome = palavra.toLowerCase();
    const args = texto.slice(palavra.length).trim();

    const chatId = msg.fromMe ? msg.to : msg.from;
    const ehGrupo = chatId.endsWith('@g.us');

    const comando = MAPA.get(nome);

    // Não é um comando fixo: pode ser o nome de uma lista (!ygo Nome).
    // Inscrição só em grupos, para a lista atualizada aparecer para todos.
    const listaDinamica =
        !comando && ehGrupo ? obterLista(normalizarChave(nome)) : null;

    if (!comando && !listaDinamica) {
        return;
    }

    const idUsuario = msg.author || msg.from;
    const idsUsuario = await resolverIds(client, idUsuario);

    // O próprio número do bot é sempre ADM (permite cadastrar o primeiro ADM)
    const ehAdm = msg.fromMe || ehAdmin(idsUsuario);

    const dados = { nome, args, chatId, ehGrupo, idUsuario, idsUsuario, ehAdm, lista: null };

    if (listaDinamica) {
        return participar(criarContexto(msg, client, { ...dados, lista: listaDinamica }));
    }

    if (comando.admin && !ehAdm) {

        if (comando.negarComReacao) {
            return msg.react('🔒').catch(() => {});
        }

        return msg.reply('🔒 Acesso negado. Esse comando é exclusivo para ADMs.');

    }

    if (comando.escopo === 'grupo' && !ehGrupo) {
        return msg.reply('⚠️ Esse comando só funciona dentro de um grupo.');
    }

    if (comando.escopo === 'lista') {

        const resolvido = resolverLista(chatId, args);

        if (!resolvido.lista) {

            if (resolvido.listas.length === 0) {

                return msg.reply(
                    ehAdm
                        ? '⚠️ Ainda não existe nenhuma lista.\n\nCrie com: *!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00*'
                        : '⚠️ Não há listas abertas no momento.'
                );

            }

            const nomes = resolvido.listas.map(l => `*${l.comando}*`).join(', ');

            return msg.reply(
                `🤔 Qual lista? Listas abertas: ${nomes}.\n\n` +
                `Exemplo: *${nome} ${resolvido.listas[0].comando} ...*`
            );

        }

        dados.lista = resolvido.lista;
        dados.args = resolvido.args;

    }

    await comando.executar(criarContexto(msg, client, dados));

};

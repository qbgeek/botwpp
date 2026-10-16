const ajuda = require('./ajuda');
const id = require('./id');
const admins = require('./admins');
const evento = require('./evento');
const lista = require('./lista');
const participar = require('./participar');
const sair = require('./sair');
const add = require('./add');
const gerenciarLista = require('./gerenciarLista');
const configuracao = require('./configuracao');
const vagas = require('./vagas');
const meta = require('./meta');
const premios = require('./premios');
const limpeza = require('./limpeza');
const todos = require('./todos');

const { obterEvento, salvarEventos } = require('../utils/eventos');
const { ehAdmin } = require('../utils/config');
const { resolverIds } = require('../utils/identidade');
const { montarLista } = require('../utils/formatacao');


// =========================================================
// TABELA DE COMANDOS
// escopo:
//   global -> funciona em qualquer conversa
//   grupo  -> só dentro de grupos
//   evento -> só em grupos com evento ativo
// admin: true -> exclusivo para ADMs (checado AQUI, antes de executar)
// =========================================================

const COMANDOS = [

    // --- Públicos ---
    { nomes: ['!ajuda', '!comandos'], escopo: 'global', executar: ajuda },
    { nomes: ['!id'], escopo: 'global', executar: id },
    { nomes: ['!lista'], escopo: 'evento', executar: lista },
    { nomes: ['!participar'], escopo: 'evento', executar: participar },
    { nomes: ['!sair'], escopo: 'evento', executar: sair },
    { nomes: ['!eusou'], escopo: 'evento', executar: gerenciarLista.euSou },
    // "!meta" é público; "!meta N" é verificado como ADM dentro do comando
    { nomes: ['!meta'], escopo: 'evento', executar: meta },

    // --- ADM: eventos e permissões ---
    { nomes: ['!eventos'], escopo: 'global', admin: true, executar: evento.listar },
    { nomes: ['!admins'], escopo: 'global', admin: true, executar: admins.listar },
    { nomes: ['!addadm'], escopo: 'global', admin: true, executar: admins.adicionar },
    { nomes: ['!deladm'], escopo: 'global', admin: true, executar: admins.remover },
    { nomes: ['!criarevento'], escopo: 'grupo', admin: true, executar: evento.criar },
    { nomes: ['!importarlegado'], escopo: 'grupo', admin: true, executar: evento.importarLegado },
    { nomes: ['!todos'], escopo: 'grupo', admin: true, executar: todos },
    { nomes: ['!encerrarevento'], escopo: 'evento', admin: true, executar: evento.encerrar },
    { nomes: ['!confirmarencerramento'], escopo: 'evento', admin: true, executar: evento.confirmarEncerramento },

    // --- ADM: configuração do evento ---
    { nomes: configuracao.COMANDOS, escopo: 'evento', admin: true, executar: configuracao },
    { nomes: ['!vagas'], escopo: 'evento', admin: true, executar: vagas.vagas },
    { nomes: ['!espera'], escopo: 'evento', admin: true, executar: vagas.espera },
    { nomes: ['!premio1', '!premio2', '!premio3'], escopo: 'evento', admin: true, executar: premios.definir },
    { nomes: ['!limparpremios'], escopo: 'evento', admin: true, executar: premios.limpar },

    // --- ADM: lista ---
    { nomes: ['!add'], escopo: 'evento', admin: true, executar: add },
    { nomes: ['!alterar'], escopo: 'evento', admin: true, executar: gerenciarLista.alterar },
    { nomes: ['!remover'], escopo: 'evento', admin: true, executar: gerenciarLista.remover },
    { nomes: ['!vincular'], escopo: 'evento', admin: true, executar: gerenciarLista.vincular },
    { nomes: ['!limparlista'], escopo: 'evento', admin: true, executar: limpeza.solicitar },
    { nomes: ['!confirmarlimpeza'], escopo: 'evento', admin: true, executar: limpeza.confirmar }

];

const MAPA = new Map();

for (const comando of COMANDOS) {
    comando.nomes.forEach(nome => MAPA.set(nome, comando));
}


function criarContexto(msg, client, dados) {

    const ctx = {
        msg,
        client,
        ...dados,

        salvar: salvarEventos,

        responder(texto, opcoes = {}) {
            return msg.reply(texto, undefined, opcoes);
        },

        // Toda alteração de lista responde com a lista atualizada
        responderComLista(cabecalho, mencoes = []) {
            return msg.reply(
                `${cabecalho}\n\n${montarLista(ctx.evento)}`,
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

    const comando = MAPA.get(nome);

    if (!comando) {
        return;
    }

    const chatId = msg.fromMe ? msg.to : msg.from;
    const ehGrupo = chatId.endsWith('@g.us');

    const idUsuario = msg.author || msg.from;
    const idsUsuario = await resolverIds(client, idUsuario);

    // O próprio número do bot é sempre ADM (permite cadastrar o primeiro ADM)
    const ehAdm = msg.fromMe || ehAdmin(idsUsuario);

    if (comando.admin && !ehAdm) {
        return msg.reply('🔒 Acesso negado. Esse comando é exclusivo para ADMs.');
    }

    if (comando.escopo !== 'global' && !ehGrupo) {
        return msg.reply('⚠️ Esse comando só funciona dentro de um grupo.');
    }

    const evento = ehGrupo ? obterEvento(chatId) : null;

    if (comando.escopo === 'evento' && !evento) {

        return msg.reply(
            ehAdm
                ? '⚠️ Este grupo ainda não tem evento.\n\nCrie um com *!criarevento pokemon*, *!criarevento magic* ou *!criarevento yugioh*.'
                : '⚠️ Não há evento ativo neste grupo no momento.'
        );

    }

    const ctx = criarContexto(msg, client, {
        nome,
        args: texto.slice(palavra.length).trim(),
        chatId,
        ehGrupo,
        idUsuario,
        idsUsuario,
        ehAdm,
        evento
    });

    await comando.executar(ctx);

};

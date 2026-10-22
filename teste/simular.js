// =========================================================
// TESTE SEM WHATSAPP (npm test)
// Simula mensagens e confere as respostas do bot.
// Roda numa cópia temporária do código, então nunca toca em
// dados/, config.json ou dados_campeonato.json do projeto.
// =========================================================

const fs = require('fs');
const os = require('os');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'botqb-teste-'));

for (const pasta of ['comandos', 'utils']) {
    fs.cpSync(path.join(RAIZ, pasta), path.join(TMP, pasta), { recursive: true });
}

// Lista no formato da versão antiga, com nomes fictícios
fs.writeFileSync(path.join(TMP, 'dados_campeonato.json'), JSON.stringify({
    inscritos: [
        { nome: 'Jogador Pago 🆗', id: 'ADM_1' },
        { nome: 'Jogador Livre', id: '900@lid' }
    ],
    listaEspera: [],
    limiteVagas: 10,
    limiteEspera: 0,
    dataCamp: '11/10/2026',
    horaCamp: '10h00',
    valorEntrada: '35,00 MASTERS, R$: 25,00 SEN/JR',
    metaPremiacao: 0,
    premio1: 'Não definido',
    premio2: 'Não definido',
    premio3: 'Não definido'
}));

const executarComando = require(path.join(TMP, 'comandos'));

const BOT = '5581000000000@c.us';
const ADM = '5581999990000@lid';
const G1 = 'grupo1@g.us';
const G2 = 'grupo2@g.us';
const G3 = 'grupo3@g.us';

// Imita o whatsapp-web.js: o mesmo número existe como @lid e @c.us
const client = {
    async getContactLidAndPhone([id]) {
        const numero = id.split('@')[0];
        return [{ lid: `${numero}@lid`, pn: `${numero}@c.us` }];
    },
    async getContactById(id) {
        return { pushname: `Perfil${id.split('@')[0]}` };
    },
    async sendMessage() {},
    pupPage: {
        async evaluate(fn, chatId) {
            return {
                nome: chatId === G1 ? 'Teste Bot QB' : `Grupo ${chatId}`,
                ehGrupo: chatId.endsWith('@g.us'),
                participantes: ['111@lid', '222@lid']
            };
        }
    }
};


// Simula o WhatsApp Web recusando campos extras na mensagem (teste do plano B do !todos)
let falharComExtra = false;


// Envia uma mensagem e devolve o que o bot fez: { respostas: [{texto, mencoes, extra}], reacoes: [] }
async function enviar(chat, autor, body, mencoes = []) {

    const fromMe = autor === 'BOT';
    const ehGrupo = chat.endsWith('@g.us');
    const resultado = { respostas: [], reacoes: [] };

    await executarComando({
        body,
        fromMe,
        client,
        author: ehGrupo && !fromMe ? autor : undefined,
        from: fromMe ? BOT : (ehGrupo ? chat : autor),
        to: fromMe ? chat : BOT,
        mentionedIds: mencoes,
        async reply(texto, chatId, opcoes = {}) {

            if (falharComExtra && opcoes.extra) {
                throw new Error('campo extra recusado (simulado)');
            }

            resultado.respostas.push({ texto, mencoes: opcoes.mentions || [], extra: opcoes.extra });

        },
        async react(emoji) {
            resultado.reacoes.push(emoji);
        }
    }, client);

    resultado.texto = resultado.respostas.map(r => r.texto).join('\n');

    return resultado;

}


let aprovados = 0;
const falhas = [];

function conferir(descricao, condicao, resultado) {

    if (condicao) {
        aprovados++;
        return;
    }

    falhas.push(`❌ ${descricao}\n   Resposta: ${resultado ? JSON.stringify(resultado.texto || resultado.reacoes) : '-'}`);

}


async function testarModoTeste() {

    process.env.BOT_SOMENTE_GRUPO = 'Teste Bot QB';

    const modoTeste = require(path.join(TMP, 'utils', 'modoTeste'));
    const log = console.log;

    console.log = () => {};

    const noGrupo = await modoTeste.foraDoTeste({ body: '!neymar', fromMe: true, to: G1, client });
    const noOutro = await modoTeste.foraDoTeste({ body: '!neymar', fromMe: true, to: G2, client });
    const noPrivado = await modoTeste.foraDoTeste({ body: '!neymar', fromMe: true, to: BOT, client });

    console.log = log;

    conferir('modo teste responde no grupo de teste', noGrupo === false);
    conferir('modo teste ignora outro grupo', noOutro === true);
    conferir('modo teste ignora conversa privada', noPrivado === true);

    delete process.env.BOT_SOMENTE_GRUPO;

}


(async () => {

    let r;

    // --- Permissões e menu ---
    r = await enviar(G1, '111@lid', '!lista');
    conferir('!lista de jogador só recebe reação 🔒', r.respostas.length === 0 && r.reacoes.includes('🔒'), r);

    r = await enviar(G1, '111@lid', '!ajuda');
    conferir('!ajuda não responde mais', r.respostas.length === 0, r);

    r = await enviar(G1, '111@lid', '!neymar');
    conferir('!neymar de jogador não mostra comandos de ADM', r.texto.includes('COMANDOS') && !r.texto.includes('ADM —'), r);
    conferir('!neymar tem o título pedido pelo cliente', r.texto.startsWith('🤖 *COMANDOS CYBERNEMAR 100% QB*'), r);

    r = await enviar(G1, '111@lid', '!ajudaney');
    conferir('!ajudaney mostra o mesmo menu', r.texto.startsWith('🤖 *COMANDOS CYBERNEMAR 100% QB*'), r);

    r = await enviar(G1, '111@lid', '!todos Teste');
    conferir('!todos é só para ADM', r.texto.includes('Acesso negado') && r.respostas[0].mencoes.length === 0, r);

    r = await enviar(G1, '111@lid', '!vagas 10');
    conferir('comando de ADM negado para jogador', r.texto.includes('Acesso negado'), r);

    r = await enviar(BOT, 'BOT', '!addadm 5581999990000');
    conferir('número do bot cadastra ADM', r.texto.includes('Novo ADM'), r);

    r = await enviar(G1, ADM, '!neymar');
    conferir('ADM (via @lid) é reconhecido e vê o menu completo', r.texto.includes('ADM — LISTAS'), r);

    // --- Criação de listas ---
    r = await enviar(G1, ADM, '!lista #ygo 30/10/2026 18h30 3 1 R$ 35,00 MASTERS, R$: 25,00 SEN/JR');
    conferir('comando único cria lista com valor cheio de vírgulas', r.texto.includes('Lista criada') && r.texto.includes('35,00 MASTERS, R$: 25,00 SEN/JR'), r);

    r = await enviar(G1, ADM, '!lista #sair');
    conferir('nome de lista não pode ser comando do bot', r.texto.includes('já é um comando'), r);

    r = await enviar(G1, ADM, '!lista #glc 30/10');
    conferir('dados incompletos explicam o formato', r.texto.includes('Não entendi'), r);

    await enviar(G1, ADM, '!lista #cup');

    r = await enviar(G1, '111@lid', '!constructor teste');
    conferir('"constructor" não é tratado como lista', r.respostas.length === 0, r);

    // --- Inscrições ---
    r = await enviar(G1, '111@lid', '!ygo');
    conferir('!ygo sem nome só explica, sem lista', r.texto.includes('Para entrar') && !r.texto.includes('LISTA DE INSCRITOS'), r);

    r = await enviar(G1, '111@lid', '!YGO Ana');
    conferir('inscrição no formato pedido e lista até o último nome', r.texto.includes('✅ *Ana* inscrito!') && r.texto.includes('Restam 2 vagas') && !/\d+\. ----/.test(r.texto), r);

    r = await enviar(G1, '111@lid', '!ygo Ana Outra');
    conferir('mesma pessoa não entra duas vezes', r.texto.includes('Você já está na lista'), r);

    await enviar(G1, '222@lid', '!ygo Bia');

    r = await enviar(G1, ADM, '!meta ygo 3');
    conferir('ajuste responde em uma linha (sem lista)', r.texto.includes('Meta definida') && !r.texto.includes('LISTA DE INSCRITOS'), r);

    r = await enviar(G1, '333@lid', '!ygo Caio');
    conferir('meta atingida avisada na mesma resposta', r.respostas.length === 1 && r.texto.includes('META ATINGIDA') && r.texto.includes('última vaga'), r);

    r = await enviar(G1, '444@lid', '!ygo Davi');
    conferir('lista cheia manda para a fila de espera', r.texto.includes('1º da fila'), r);

    r = await enviar(G1, '555@lid', '!ygo Edu');
    conferir('lista e espera lotadas recusam', r.texto.includes('lotadas'), r);

    r = await enviar(G1, ADM, '!vagas 5');
    conferir('grupo com várias listas pergunta qual', r.texto.includes('Qual lista?'), r);

    // --- Pago e saída ---
    r = await enviar(G1, ADM, '!pago ygo 1');
    conferir('!pago coloca o 🆗', r.texto.includes('Ana 🆗'), r);

    r = await enviar(G1, '111@lid', '!sair');
    conferir('vaga paga não sai sozinha', r.texto.includes('confirmada pela organização'), r);

    await enviar(G1, ADM, '!naopago ygo 1');
    await enviar(G1, ADM, '!vagas cup 5');
    await enviar(G1, '111@lid', '!cup Ana');

    r = await enviar(G1, '111@lid', '!sair');
    conferir('!sair em duas listas pergunta de qual', r.texto.includes('De qual quer sair'), r);

    r = await enviar(G1, '111@lid', '!sair ygo');
    conferir('quem sobe da espera é marcado', r.texto.includes('saiu da fila de espera') && r.respostas[0].mencoes.includes('444@lid'), r);

    r = await enviar(G1, ADM, '!add cup @777 Fê', ['777@lid']);
    conferir('!add @pessoa vincula a vaga', r.texto.includes('foi adicionado aos inscritos') && r.respostas[0].mencoes.includes('777@lid'), r);

    r = await enviar(G1, '777@lid', '!sair');
    conferir('adicionado por ADM não sai sozinho', r.texto.includes('confirmada pela organização'), r);

    // --- Acentos, ajustes, nova edição e exclusão ---
    await enviar(G1, ADM, '!lista #MESÃO 01/11/2026 14h 2 0');

    r = await enviar(G1, '888@lid', '!mesao Gabi');
    conferir('acento e maiúsculas não importam', r.texto.includes('*Gabi* inscrito!'), r);

    r = await enviar(G1, ADM, '!setdata ygo 31/10/2026');
    conferir('!setdata responde em uma linha', r.texto === '✅ Data (*ygo*): *31/10/2026*', r);

    r = await enviar(G1, ADM, '!lista #ygo 07/11/2026 18h30 4 2');
    conferir('recriar lista existente pede confirmação', r.texto.includes('zerar os inscritos') && r.texto.includes('!confirmar'), r);

    r = await enviar(G1, '111@lid', '!confirmar');
    conferir('jogador não confirma ação de ADM', r.texto.includes('Acesso negado'), r);

    r = await enviar(G1, ADM, '!confirmar');
    conferir('nova edição zera e mantém o valor', r.texto.includes('Nova edição') && r.texto.includes('(0/4)') && r.texto.includes('35,00 MASTERS'), r);

    await enviar(G1, ADM, '!excluirlista mesao');
    r = await enviar(G1, ADM, '!confirmar');
    conferir('!excluirlista + !confirmar exclui', r.texto.includes('excluída'), r);

    r = await enviar(G1, '888@lid', '!mesao Gabi');
    conferir('lista excluída para de responder', r.respostas.length === 0, r);

    // --- Listas globais: funcionam em qualquer grupo ---
    r = await enviar(G2, '999@lid', '!ygo Zé');
    conferir('lista criada num grupo funciona em outro grupo', r.texto.includes('✅ *Zé* inscrito!'), r);

    r = await enviar('111@c.us', '111@c.us', '!ygo Ana');
    conferir('inscrição pelo privado é ignorada', r.respostas.length === 0, r);

    r = await enviar('5581999990000@c.us', '5581999990000@c.us', '!pago ygo 1');
    conferir('ADM gerencia a lista pelo privado', r.texto.includes('Zé 🆗'), r);

    r = await enviar(G1, ADM, '!listas');
    conferir('!listas mostra todas as listas e onde foram criadas', r.texto.includes('!ygo') && r.texto.includes('!cup') && r.texto.includes('Criada em: Teste Bot QB'), r);

    // --- Importação e !todos ---
    r = await enviar(G3, ADM, '!importarlegado #liga');
    conferir('importação mantém título e converte 🆗 em pago', r.texto.includes('LIGA QB!') && r.texto.includes('Jogador Pago 🆗') && r.texto.includes('!liga Seu Nome'), r);

    r = await enviar(G3, ADM, '!vagas 20');
    conferir('sem nome, usa a única lista criada no grupo', r.texto.includes('Vagas definidas (*liga*)'), r);

    r = await enviar(G3, '900@lid', '!sair');
    conferir('quem entrou sozinho na versão antiga consegue sair', r.texto.includes('*Jogador Livre* saiu'), r);

    r = await enviar(G1, ADM, '!todos Começa às 18h30!');
    conferir('!todos marca todos os participantes', r.respostas[0]?.mencoes.length === 2, r);
    conferir('!todos mantém o texto e mostra só @all', r.texto === '📢 🔔 Começa às 18h30!\n\n@all' && !r.texto.includes('@111'), r);
    conferir('!todos pede o @all nativo', r.respostas[0]?.extra?.nonJidMentions === 1, r);

    // Se o WhatsApp Web recusar o campo do @all, reenvia sem ele
    falharComExtra = true;
    r = await enviar(G1, ADM, '!todos Plano B');
    falharComExtra = false;
    conferir('!todos funciona mesmo se o @all nativo for recusado', r.respostas.length === 1 && r.respostas[0].mencoes.length === 2 && !r.respostas[0].extra, r);

    await testarModoTeste();

    fs.rmSync(TMP, { recursive: true, force: true });

    if (falhas.length) {
        console.log(falhas.join('\n'));
        console.log(`\n${aprovados} aprovados, ${falhas.length} falharam.`);
        process.exit(1);
    }

    console.log(`✅ ${aprovados} testes aprovados.`);

})().catch(erro => {
    fs.rmSync(TMP, { recursive: true, force: true });
    console.error('❌ Erro ao rodar os testes:', erro);
    process.exit(1);
});

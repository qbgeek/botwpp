console.log("INICIANDO BOT...");
console.log("✅ Arquivo index.js carregado");
console.time("Tempo total");
console.time("Tempo WhatsApp");

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs'); // Módulo para lidar com arquivos

const gerarBarraMeta = require('./utils/barraMeta');

const executarComando = require('./comandos');

const {
    salvarDados,
    carregarDados,
    corrigirDados
} = require('./utils/dados');


// =========================================================
// CONFIGURAÇÕES E PERSISTÊNCIA
// =========================================================

const {
    carregarConfig,
    salvarConfig
} = require('./utils/config');

const config = carregarConfig();

console.log("✅ Configuração carregada");
    

let controleLimpeza = {
    aguardandoConfirmacaoLimpeza: false
};

// --- VARIÁVEIS DE MEMÓRIA (CARREGADAS DO ARQUIVO) ---

let dados = {
    inscritos: [],
    listaEspera: [],
    limiteVagas: 0,
    limiteEspera: 0,
    dataCamp: "---",
    horaCamp: "---",
    valorEntrada: "----",
    metaPremiacao: 0,
    premio1: "Não definido",
    premio2: "Não definido",
    premio3: "Não definido"
};





dados = carregarDados() || dados;

console.log("✅ Dados do campeonato carregados");

corrigirDados(dados);

salvarDados(dados);

// =========================================================
// INICIALIZAÇÃO DO BOT
// =========================================================
// BARRA DE PROGRESSO DA META
// =========================================================

// =========================================================
console.log("⏳ Preparando WhatsApp...");
const client = new Client({
    
    authStrategy: new LocalAuth(),
   puppeteer: {
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check'
],
    headless: true
}
});

const verificarSeEhAdm = async (mensagem) => {

    const idUsuario = mensagem.author || mensagem.from;

    return config.admins.includes(idUsuario);

};

client.on('qr', qr => qrcode.generate(qr, { small: true }));

client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Carregando WhatsApp: ${percent}% - ${message}`);
});

client.on('authenticated', () => {
    console.log("🔐 WhatsApp autenticado!");
});

client.on('change_state', state => {
    console.log("📡 Estado WhatsApp:", state);
});

client.on('auth_failure', msg => {
    console.log("❌ Falha na autenticação:");
    console.log(msg);
});

client.on('ready', () => {


    console.timeEnd("Tempo WhatsApp");
    console.timeEnd("Tempo total");

    console.log('------------------------------------------');
    console.log('🏆 BOT DA QB ONLINE!');
    console.log('------------------------------------------');

});

client.on('message_create', async (msg) => {



if (!msg.body) return;

const cmd = msg.body.toLowerCase();
const idUsuario = msg.author || msg.from;

await executarComando(
    msg,
    cmd,
    dados,
    salvarDados,
    controleLimpeza,
    verificarSeEhAdm
);


    if (msg.fromMe && !msg.body.startsWith('!')) return;

    // =========================
// !todos
// =========================
if (cmd === '!todos') {

    const autorizado = await verificarSeEhAdm(msg);

    if (!autorizado) {
        return msg.reply('❌ Acesso negado.');
    }

    return comandoTodos(msg);

}

    // --- COMANDOS DE ADM ---
const comandosAdmin = [

'!setdata ',
'!sethora ',
'!setvalor ',
'!vagas ',
'!espera ',
'!add ',
'!addadm ',
'!deladm ',
'!alterar ',
'!remover ',
'!limparlista',
'!confirmarlimpeza',
'!todos',
'!meta ',
'!premio1 ',
'!premio2 ',
'!premio3 ',
'!limparpremios'
];
    if (comandosAdmin.some(c => cmd.startsWith(c))) {
        const autorizado = await verificarSeEhAdm(msg);
        if (!autorizado) return msg.reply('❌ Acesso negado.');

        // =========================
// !addadm
// =========================
if (cmd.startsWith('!addadm ')) {

    const novoID = msg.body.slice(8).trim();

    if (!novoID) {
        return msg.reply("❌ Informe um ID.");
    }

    if (config.admins.includes(novoID)) {
        return msg.reply("⚠️ Esse ID já é administrador.");
    }

    config.admins.push(novoID);

    salvarConfig(config);

    return msg.reply(
        `✅ Novo administrador adicionado!\n\n${novoID}`
    );

}

// =========================
// !deladm
// =========================
else if (cmd.startsWith('!deladm ')) {

    const id = msg.body.slice(8).trim();

    const indice = config.admins.indexOf(id);

    if (indice === -1) {
        return msg.reply("❌ Esse ID não existe.");
    }

    config.admins.splice(indice, 1);

    salvarConfig(config);

    return msg.reply(
        `🗑️ Administrador removido!\n\n${id}`
    );

}

        if (
    cmd.startsWith('!setdata ') ||
    cmd.startsWith('!sethora ') ||
    cmd.startsWith('!setvalor ')
) {

    return comandoConfiguracao(msg, dados, salvarDados);

}
        else if (
    cmd.startsWith('!vagas ') ||
    cmd.startsWith('!espera ')
) {

    return comandoVagas(msg, dados, salvarDados);

}
        else if (cmd.startsWith('!add ')) {

        return comandoAdd(msg, dados, salvarDados);

  

}
else if (cmd.startsWith('!meta ')) {

    return comandoMeta(msg, dados);

}
else if (
    cmd.startsWith('!premio1 ') ||
    cmd.startsWith('!premio2 ') ||
    cmd.startsWith('!premio3 ') ||
    cmd === '!limparpremios'
) {

    return comandoPremios(msg, dados);

}
else if (cmd.startsWith('!alterar ')) {

    return comandoGerenciarLista(msg, dados);

}

else if (cmd.startsWith('!remover ')) {

    return comandoGerenciarLista(msg, dados);

}

            
else if (cmd === '!limparlista' || cmd === '!confirmarlimpeza') {

    return comandoLimpeza(msg, dados, controleLimpeza);

}



}

    // --- COMANDOS PÚBLICOS ---
    if (cmd.startsWith('!participar')) {
    return comandoParticipar(msg, dados, salvarDados);
}
    if (cmd === '!meta') {

    return comandoMeta(msg, dados);

}
    
        
    if (cmd === '!sair') {
    return comandoSair(msg, dados, salvarDados);
}


if (cmd === '!id') {
    return comandoId(msg, verificarSeEhAdm);
}
if (cmd === '!id') {
    return comandoId(msg, verificarSeEhAdm);
}
});

process.on('unhandledRejection', (erro) => {
    console.log("⚠️ Erro não tratado (unhandledRejection):");
    console.log(erro);
});

process.on('uncaughtException', (erro) => {
    console.log("⚠️ Erro não tratado (uncaughtException):");
    console.log(erro);
});

console.log("🚀 Enviando comando para iniciar WhatsApp...");


client.initialize();

setTimeout(() => {
    console.log("⚠️ Mais de 30 segundos esperando o WhatsApp ficar pronto...");
}, 30000);

console.log("📲 WhatsApp começou o processo de conexão...");
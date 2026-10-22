console.log("INICIANDO BOT...");
console.time("Tempo total");
console.time("Tempo WhatsApp");

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const executarComando = require('./comandos');
const { todasAsListas } = require('./utils/armazenamento');
const { config } = require('./utils/config');
const modoTeste = require('./utils/modoTeste');

console.log(`✅ Configuração carregada (${config.admins.length} ADMs)`);
console.log(`✅ Listas carregadas (${todasAsListas().length} abertas)`);

if (modoTeste.ativo) {
    console.log(`🧪 MODO TESTE: só responde nos grupos ${modoTeste.GRUPOS_TESTE.map(g => `"${g}"`).join(', ')}`);
}


// =========================================================
// INICIALIZAÇÃO DO BOT
// =========================================================

console.log("⏳ Preparando WhatsApp...");

// O sandbox do Chrome isola o navegador do resto do computador.
// Ele só é desligado no Linux, onde rodar como root/Docker exige isso.
const argsSandbox = process.platform === 'linux'
    ? ['--no-sandbox', '--disable-setuid-sandbox']
    : [];

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            ...argsSandbox,
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-gpu',
            '--no-first-run',
            '--no-default-browser-check'
        ],
        headless: true
    }
});

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

// O WhatsApp Web pode disparar "ready" de novo ao reconectar (queda de
// internet, celular offline, atualização do site). O tempo de inicialização
// só é medido na primeira vez; nas seguintes, apenas registra a reconexão.
let jaFicouPronto = false;

client.on('ready', () => {

    clearTimeout(avisoDemora);

    if (jaFicouPronto) {
        console.log(`🔄 WhatsApp reconectado (${new Date().toLocaleString('pt-BR')})`);
        return;
    }

    jaFicouPronto = true;

    console.timeEnd("Tempo WhatsApp");
    console.timeEnd("Tempo total");

    console.log('------------------------------------------');
    console.log('🏆 BOT DA QB ONLINE!');
    console.log('------------------------------------------');

});

// "message_create" inclui mensagens enviadas pelo próprio número do bot,
// para que o dono do número também consiga usar os comandos.
client.on('message_create', async (msg) => {

    try {

        if (await modoTeste.foraDoTeste(msg)) {
            return;
        }

        await executarComando(msg, client);

    } catch (erro) {

        console.log("❌ Erro ao processar comando:", msg.body);
        console.log(erro);

        msg.reply('❌ Ops! Algo deu errado ao processar esse comando. Tente novamente.').catch(() => {});

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

// Avisa se o WhatsApp demorar; é cancelado quando o bot fica pronto
const avisoDemora = setTimeout(() => {
    console.log("⚠️ Mais de 30 segundos esperando o WhatsApp ficar pronto...");
}, 30000);

client.initialize();

console.log("📲 WhatsApp começou o processo de conexão...");

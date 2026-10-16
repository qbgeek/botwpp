console.log("INICIANDO BOT...");
console.time("Tempo total");
console.time("Tempo WhatsApp");

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const executarComando = require('./comandos');
const { listarEventos } = require('./utils/eventos');
const { config } = require('./utils/config');

console.log(`✅ Configuração carregada (${config.admins.length} ADMs)`);
console.log(`✅ Eventos carregados (${listarEventos().length} ativos)`);


// =========================================================
// INICIALIZAÇÃO DO BOT
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

    clearTimeout(avisoDemora);

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

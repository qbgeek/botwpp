const comandoLista = require('./lista');
const comandoAdd = require('./add');
const comandoConfiguracao = require('./configuracao');
const comandoVagas = require('./vagas');
const comandoMeta = require('./meta');
const comandoPremios = require('./premios');
const comandoGerenciarLista = require('./gerenciarLista');
const comandoLimpeza = require('./limpeza');
const comandoId = require('./id');
const comandoParticipar = require('./participar');
const comandoSair = require('./sair');
const comandoAjuda = require('./ajuda');
const comandoTodos = require('./todos');


module.exports = async function executarComando(
    msg,
    cmd,
    dados,
    salvarDados,
    controleLimpeza,
    verificarSeEhAdm
) {
        if (cmd === '!ajuda' || cmd === '!comandos') {

        const ehAdm = await verificarSeEhAdm(msg);

        return comandoAjuda(msg, ehAdm);

    }


    if (cmd === '!lista') {
        return comandoLista(msg, dados);
    }


    if (cmd.startsWith('!participar')) {
        return comandoParticipar(msg, dados, salvarDados);
    }


    if (cmd === '!sair') {
        return comandoSair(msg, dados, salvarDados);
    }


    if (cmd.startsWith('!add ')) {
        return comandoAdd(msg, dados, salvarDados);
    }


    if (
        cmd.startsWith('!setdata ') ||
        cmd.startsWith('!sethora ') ||
        cmd.startsWith('!setvalor ')
    ) {
        return comandoConfiguracao(msg, dados, salvarDados);
    }


    if (
        cmd.startsWith('!vagas ') ||
        cmd.startsWith('!espera ')
    ) {
        return comandoVagas(msg, dados, salvarDados);
    }


    if (cmd === '!meta' || cmd.startsWith('!meta ')) {
        return comandoMeta(msg, dados);
    }


    if (
        cmd.startsWith('!premio1 ') ||
        cmd.startsWith('!premio2 ') ||
        cmd.startsWith('!premio3 ') ||
        cmd === '!limparpremios'
    ) {
        return comandoPremios(msg, dados);
    }


    if (
        cmd.startsWith('!alterar ') ||
        cmd.startsWith('!remover ')
    ) {
        return comandoGerenciarLista(msg, dados);
    }


    if (
        cmd === '!limparlista' ||
        cmd === '!confirmarlimpeza'
    ) {
        return comandoLimpeza(
            msg,
            dados,
            controleLimpeza
        );
    }


    if (cmd === '!id') {
        return comandoId(msg, verificarSeEhAdm);
    }

        if (cmd === '!todos') {

        const autorizado = await verificarSeEhAdm(msg);

        if (!autorizado) {
            return msg.reply('❌ Acesso negado.');
        }

        return comandoTodos(msg);

    }
};
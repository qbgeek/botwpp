const { solicitarConfirmacao, confirmar: confirmarAcao } = require('../utils/confirmacoes');


async function solicitar(ctx) {

    solicitarConfirmacao(ctx.chatId, 'limpeza');

    return ctx.responder(
`⚠️ *ATENÇÃO!*

Você está prestes a limpar o evento *${ctx.evento.titulo}*.

Serão apagados:

🗑️ Lista de inscritos
🗑️ Lista de espera
🗑️ Data e horário
🗑️ Meta de jogadores
🗑️ Premiações especiais

Serão mantidos:

✅ Título, local e premiação base
✅ Valor da inscrição
✅ Quantidade de vagas e de espera

Para confirmar, digite em até 2 minutos:

*!confirmarlimpeza*`
    );

}


async function confirmar(ctx) {

    if (!confirmarAcao(ctx.chatId, 'limpeza')) {
        return ctx.responder('❌ Nenhuma limpeza pendente (ou o prazo expirou). Use *!limparlista* primeiro.');
    }

    const { evento } = ctx;

    evento.inscritos = [];
    evento.listaEspera = [];
    evento.dataCamp = '---';
    evento.horaCamp = '---';
    evento.metaPremiacao = 0;
    evento.premio1 = 'Não definido';
    evento.premio2 = 'Não definido';
    evento.premio3 = 'Não definido';

    ctx.salvar();

    await ctx.reagir('🧹');

    return ctx.responderComLista('🧹 *Evento reiniciado com sucesso!* Novo campeonato pronto! 🚀');

}


module.exports = {
    solicitar,
    confirmar
};

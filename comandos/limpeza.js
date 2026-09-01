const { salvarDados } = require("../utils/dados");


module.exports = async function(msg, dados, controle) {


    if (msg.body.toLowerCase() === '!limparlista') {


        controle.aguardandoConfirmacaoLimpeza = true;


        return msg.reply(
`⚠️ *ATENÇÃO!*

Você está prestes a limpar o campeonato atual.

Serão apagados:

✅ Lista de inscritos
✅ Lista de espera
✅ Data do campeonato
✅ Horário
✅ Meta de jogadores
✅ Premiações especiais

💰 O valor da inscrição será mantido.

Para confirmar a limpeza, digite:

*!confirmarlimpeza*`
        );

    }



    if (msg.body.toLowerCase() === '!confirmarlimpeza') {


        if (!controle.aguardandoConfirmacaoLimpeza) {


            return msg.reply(
                '❌ Nenhuma limpeza pendente. Use !limparlista primeiro.'
            );

        }



        dados.inscritos = [];

        dados.listaEspera = [];

        dados.limiteVagas = 0;

        dados.limiteEspera = 0;

        dados.dataCamp = "---";

        dados.horaCamp = "---";

        dados.metaPremiacao = 0;

        dados.premio1 = "Não definido";

        dados.premio2 = "Não definido";

        dados.premio3 = "Não definido";



        salvarDados(dados);



        controle.aguardandoConfirmacaoLimpeza = false;



        return msg.reply(
`🧹 *Campeonato reiniciado com sucesso!*

✅ Lista de inscritos apagada
✅ Lista de espera apagada
✅ Data removida
✅ Horário removido
✅ Meta removida
✅ Premiações removidas

💰 Valor da inscrição mantido:
R$ ${dados.valorEntrada}

Novo campeonato pronto!`
        );

    }


};
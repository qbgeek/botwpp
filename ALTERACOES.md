# Alterações — nova versão do bot

Este documento lista tudo o que foi corrigido, alterado e adicionado no bot da QB Geek. O trabalho foi feito na branch `feat/multi-eventos` e depois levado para a `master`. A versão antiga está guardada na branch `projeto-legado`.

O passo a passo de teste e instalação está no [README.md](README.md).

## Resumo

1. **Correção de todos os erros identificados**: o principal é que qualquer pessoa conseguia executar comandos de ADM.
2. **Várias listas com nome livre, válidas em todos os grupos**: o ADM cria `!lista #ygo` e a galera entra com `!ygo Nome` em qualquer grupo do bot, inclusive grupos criados depois. Várias listas podem estar abertas ao mesmo tempo (`!ygo`, `!cup`, `!glc`, `!mesão`…).
3. **Criação em um comando só**: `!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00`.
4. **Lista atualizada a cada inscrição**, mostrando só até o último nome. O `!lista` de consulta deixou de ser público.
5. **`!pago 14`** coloca o 🆗 ao lado do nome. Vaga paga ou adicionada pelo ADM não sai sozinha.
6. **Menu `!neymar`** (ou `!ajudaney`), dividido entre jogadores e ADM, sem `!id` e sem os comandos das listas.

---

## 1. Pedidos do Artur e como ficaram

| Pedido | Como ficou |
|--------|------------|
| "Que todos os comandos da ADM não possam ser usados por ninguém" | A permissão é checada antes de qualquer comando de ADM |
| Menu dividido entre público e ADM | O `!neymar` só mostra a parte de ADM para ADMs |
| `!ajuda` / `!comandos` passa a ser `!neymar` | `!neymar` (e `!ajudaney`). `!ajuda` e `!comandos` não respondem mais |
| Tirar o `!id` do menu | Fora do menu; virou comando só de ADM |
| "`!lista ygo` cria uma lista pro comando `!ygo`"; inscrição com "`!ygo lucas chagas`" | `!lista #ygo` cria; `!ygo Nome` inscreve |
| Comandos funcionando em qualquer grupo (o cliente pode criar grupos novos) | Listas globais: valem em todos os grupos do bot, sem configuração. Os comandos de ADM também funcionam no privado do bot |
| Listas: `!GLC`, `!YGO`, `!MESÃO`, `!CUP`, `!PRERELEASE`, `!CHALLENGE`, `!PREMIERE` | Qualquer nome funciona; maiúsculas e acentos são ignorados (`!MESÃO` = `!mesao`) |
| Não mostrar esses comandos no menu | O menu não lista as listas; o comando de entrada aparece no fim de cada lista |
| Data, hora e valor de cada lista num comando só | `!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00` |
| Mostrar a lista atualizada ao se inscrever, no formato "✅ Artur inscrito! 📋 Restam 10 vagas" + lista | Exatamente esse formato |
| "Exibisse até o último nome que foi adicionado" | As linhas "----" das vagas vazias não aparecem mais |
| "A gente exclui o comando `!lista`", por causa do spam | `!lista` virou comando de ADM; para quem não é ADM, o bot só reage com 🔒, sem mensagem |
| `!pago 14` coloca o 🆗 ao lado do nome | Feito, inclusive para quem entrou sozinho; `!naopago` desfaz |
| `!add` é para quem pagou antes, só o ADM adiciona | Quem foi adicionado pelo ADM não sai sozinho |
| Marcar todos (`!todos`) | Corrigido; o comando nunca tinha funcionado |
| Sistema de avaliação/denúncia | **Não feito.** O próprio Artur desistiu ("muito trabalho, pra pouquíssimo retorno") |

---

## 2. Correções de erros

| # | Problema | Impacto | Correção |
|---|----------|---------|----------|
| 1 | Os comandos de ADM eram executados **antes** de checar se a pessoa era ADM | Qualquer membro podia apagar a lista ou mudar vagas. O histórico do grupo mostra isso acontecendo: o comando rodava e só depois vinha "Acesso negado" | A permissão é verificada num único lugar ([comandos/index.js](comandos/index.js)), **antes** de executar |
| 2 | Código duplicado em `index.js` chamava funções inexistentes | Quase todo comando gerava `ReferenceError` no log | Código removido; o `index.js` só inicia o WhatsApp |
| 3 | `!add` criava um ID falso (`ADM_<número>`) | O `!sair` nunca encontrava a pessoa | A vaga agora é marcada como "adicionada pelo ADM" e só um ADM a remove (seção 5) |
| 4 | O bot respondia comandos de lista no privado | Era possível se inscrever pelo privado | A inscrição (`!ygo Nome`) só funciona em grupos |
| 5 | `!limparlista` zerava as vagas sem avisar | Ninguém conseguia se inscrever até um novo `!vagas` | A limpeza mantém vagas, reservas, valor, título e local |
| 6 | `dados_campeonato.json` (com nomes reais) estava no git | Dados pessoais versionados | Removido do git e adicionado ao `.gitignore`, junto com a pasta `dados/` |
| 7 | `!todos` passava as opções no lugar errado | O comando nunca funcionou | Corrigido; aceita mensagem: `!todos Começa às 19h!` |
| 8 | Se o JSON corrompesse, o bot o **sobrescrevia** vazio | Perda total da lista | O arquivo corrompido é copiado para `*.corrompido-<data>` antes |
| 9 | Gravação direta no arquivo | Uma queda podia deixar o JSON pela metade | Grava em arquivo temporário e depois renomeia ([utils/arquivoJson.js](utils/arquivoJson.js)) |
| 10 | Caminhos relativos (`./config.json`) | Iniciar de outra pasta criava arquivos no lugar errado | Caminhos baseados na pasta do projeto |
| 11 | `config.json` inválido derrubava o bot | Bot não subia | Leitura protegida, com backup do arquivo inválido |
| 12 | Não havia como cadastrar o primeiro ADM pelo WhatsApp | Era preciso editar o `config.json` à mão | O número do bot é sempre ADM; `!addadm @pessoa` aceita marcação |
| 13 | Comandos reconhecidos por "começa com" (`!participarXYZ`) | Comportamento inesperado | O comando precisa ser a primeira palavra exata |
| 14 | `!meta 0` era recusado | Não dava para desligar a meta | `!meta 0` desativa |
| 15 | A confirmação de limpeza era global e não expirava | Era possível confirmar horas depois | Confirmação por grupo, válida por 2 minutos |
| 16 | Aumentar as vagas não puxava a fila de espera | Gente esperando com vaga livre | Ao aumentar as vagas, a fila sobe automaticamente e quem subiu é marcado |
| 17 | `!alterar` e `!remover` só funcionavam na lista principal | Não dava para corrigir a fila de espera | Use `e1`, `e2`… (ex.: `!remover e1`) |
| 18 | O aviso "Mais de 30 segundos esperando o WhatsApp" aparecia sempre | Log confuso | O aviso é cancelado quando o bot fica pronto |
| 19 | O WhatsApp identifica a mesma pessoa por número (`@c.us`) ou ID anônimo (`@lid`) | ADM não reconhecido, ou `!sair` sem encontrar a pessoa | O bot resolve as duas formas ([utils/identidade.js](utils/identidade.js)) |
| 20 | Erros em comandos ficavam sem resposta | O usuário ficava sem saber se funcionou | Erro registrado no log e resposta "Algo deu errado" |
| 21 | Nomes sem limite de tamanho | Uma mensagem gigante poluía a lista | Nomes limitados a 40 caracteres; textos de configuração a 120 |
| 22 | O Chrome do bot rodava com `--no-sandbox` em qualquer sistema | No Windows, todo o navegador (que exibe as mensagens recebidas) rodava sem isolamento do resto do computador | O sandbox só é desligado no Linux, onde rodar como root/Docker exige isso |
| 23 | Um nome de lista igual a uma propriedade interna do JavaScript (`constructor`) era confundido com uma lista | `!constructor` causava erro e um ADM podia alterar um objeto interno | Busca da lista feita só nas listas cadastradas (`Object.hasOwn`) |
| 25 | `msg.getChat()` do whatsapp-web.js 1.34.7 falha nas versões atuais do WhatsApp Web ("No key or key range specified" ao buscar a última mensagem do grupo) | `!todos` não funcionava e o modo teste ignorava tudo | Leitura direta só do nome e dos participantes do grupo ([utils/whatsapp.js](utils/whatsapp.js)) |
| 24 | Dependências com vulnerabilidades conhecidas | `npm audit` apontava 12 alertas | `npm audit fix` sem quebra: 9 restantes, todos na cadeia usada só para baixar o Chrome (ver seção 10) |

---

## 3. Listas com nome livre

### Como funciona

- O ADM cria uma lista com um nome qualquer, e **esse nome vira o comando de inscrição**: a lista `#ygo` responde a `!ygo`.
- **As listas são globais**: uma lista criada em qualquer grupo (ou no privado do bot) funciona em **todos os grupos** em que o bot está, inclusive grupos criados depois. Várias listas podem estar abertas ao mesmo tempo.
- A **inscrição** (`!ygo Nome`) só funciona em grupos, para a lista atualizada aparecer para todos. Os comandos de ADM funcionam também no privado do bot.
- O bot guarda o grupo onde cada lista foi criada. Isso serve de atalho nos comandos de ADM (ver "Ajustes rápidos") e aparece no `!listas`.
- Todas as listas têm **a mesma estrutura**; só mudam os dados (data, hora, valor, vagas, prêmios…).
- Os **ADMs são globais**: quem é ADM, é ADM em todos os grupos.
- O nome não diferencia maiúsculas nem acentos (`!MESÃO`, `!Mesão` e `!mesao` são a mesma lista). Não pode começar com número nem repetir um comando do bot (ex.: `#sair`).

### Criar ou recomeçar com um comando só

```
!lista #ygo 30/10/2026 18h30 24 12 R$ 35,00 MASTERS, R$: 25,00 SEN/JR
        │     │         │    │  │   └── valor (opcional, o resto da mensagem)
        │     │         │    │  └────── reservas (fila de espera)
        │     │         │    └───────── vagas
        │     │         └────────────── hora (sem espaços: 18h30, 10h00AM)
        │     └──────────────────────── data
        └────────────────────────────── nome da lista
```

- **O valor vem por último**, então pode ter espaços e vírgulas.
- **Se a lista já existe**, o comando **abre uma nova edição**: o bot pede `!confirmar`, zera os inscritos e aplica os novos dados. Isso substitui o ritual semanal de `!limparlista` + `!setdata` + `!sethora` + `!vagas`.
- Sem valor, a nova edição **mantém o valor anterior**.
- `!lista #ygo` sem dados mostra a lista. Se ela não existir, cria uma lista vazia para configurar depois.

### Ajustes rápidos

Os comandos de ajuste recebem o nome da lista logo depois do comando: `!vagas ygo 28`, `!setvalor cup 15,00`, `!pago ygo 14`.

**O nome é opcional** em dois casos: se só existir uma lista, ou se só uma lista foi criada no grupo onde o comando foi enviado. Nesses casos, `!vagas 28` e `!pago 14` funcionam direto. Fora disso, o bot pergunta: "Qual lista? Listas abertas: ygo, cup".

### Estrutura de dados

O antigo `dados_campeonato.json` (uma lista só) foi substituído por `dados/listas.json`:

```json
{
  "cup": {
    "chave": "cup",
    "comando": "cup",
    "titulo": "CUP",
    "grupoOrigem": "120363000000000000@g.us",
    "nomeGrupoOrigem": "Liga Pokémon QB Geek",
    "dataCamp": "30/10/2026",
    "horaCamp": "18h30",
    "valorEntrada": "20,00",
    "local": "R. da Hora, 345 - Loja 14 - Espinheiro, Recife - PE, 52020-010",
    "premiacaoBase": "Créditos em loja.",
    "limiteVagas": 24,
    "limiteEspera": 12,
    "metaPremiacao": 0,
    "premio1": "Não definido",
    "premio2": "Não definido",
    "premio3": "Não definido",
    "inscritos": [
      {
        "nome": "Lucas Chagas",
        "id": "123456789@lid",
        "ids": ["123456789@lid", "5581999999999@c.us"],
        "pago": true,
        "adicionadoPorAdm": false
      }
    ],
    "listaEspera": []
  }
}
```

Um arquivo no formato intermediário (listas separadas por grupo, de versões de teste) é convertido automaticamente ao iniciar.

---

## 4. Lista atualizada (e menos spam)

- **Quando muda alguém na lista**, o bot responde com o aviso e a lista completa, na mesma mensagem. Isso vale para inscrição, saída, `!add`, `!remover`, `!alterar`, `!pago`, `!naopago`, `!vincular`, nova edição, limpeza e importação.
- **A lista vai só até o último nome**, sem as linhas "----".
- **Ajustes de configuração** (`!setdata`, `!sethora`, `!setvalor`, `!vagas`, `!espera`, `!meta`, `!premio…`) respondem **numa linha só**. A exceção é o `!vagas`, quando ele puxa gente da fila de espera.
- **`!ygo` sem nome** só responde "✍️ Para entrar: *!ygo Seu Nome*", sem lista. Assim o hábito do `!lista` não volta.
- **`!lista` de quem não é ADM** recebe só a reação 🔒, sem mensagem.

Exemplo de resposta a `!ygo Artur`, no layout que o Artur pediu:

```
✅ *Artur* inscrito!

📋 Restam 10 vagas

🏆 *LIGA QB!*

🗓️:  18/10/2026
⏰:  13h30
💰:  R$ 20,00
🎁 *PREMIAÇÃO BASE:*
Créditos em loja.

📍: R. da Hora, 345 - Loja 14 - Espinheiro, Recife - PE, 52020-010
------------------------------------------
🏆 *LISTA DE INSCRITOS (14/24)* 🏆

1. Mario Henrique
2. ster super pro player 🦈🦈🦈
...
14. Artur

✍️ Para entrar: *!liga Seu Nome*
```

---

## 5. Pagamentos e quem pode sair sozinho

- **`!pago 14`** coloca o 🆗 ao lado do nome na posição 14, tenha a pessoa entrado sozinha ou pelo ADM. **`!naopago 14`** desfaz. Na fila de espera: `!pago e1`.
- **Quem entrou sozinho** (`!ygo Nome`) e não está pago **sai sozinho** com `!sair`.
- **Quem está pago (🆗) ou foi adicionado pelo ADM (`!add`)** não sai sozinho. O bot responde: "Sua vaga está confirmada pela organização. Para sair, fale com um ADM." Reembolso e troca ficam a critério do ADM.
- **`!add @pessoa`** vincula a vaga ao WhatsApp da pessoa. Ela continua sem poder sair sozinha, mas é marcada quando subir da fila e não consegue se inscrever duas vezes.
- **`!vincular nº @pessoa`** (ADM) faz a mesma ligação numa vaga que já existe.
- O comando `!eusou` (assumir uma vaga criada pelo ADM) **foi removido**, porque deixaria alguém tomar uma vaga paga.
- **`!sair` com várias listas**: se a pessoa estiver em uma só, `!sair` basta. Se estiver em mais de uma, o bot pergunta: "Você está em ygo e cup. Use *!sair ygo*".

---

## 6. Emojis e efeitos

| Efeito | Quando |
|--------|--------|
| **Reação na mensagem** do usuário (✅ ⏳ 🏃 🚫 🆗 ↩️ ✏️ 🗑️ 📏 🔥 🥇 🧹 🆕 🏁 🔒) | Confirma a ação sem gerar mensagem nova |
| **Marcação (@)** de quem sobe da fila de espera | Quando alguém sai, é removido ou as vagas aumentam |
| **"🎉🎊 META ATINGIDA!"** | No momento em que a meta é batida, **na mesma resposta** (sem mensagem extra) |
| **"🔒 Essa foi a última vaga, lista completa!"** | Quando a lista principal lota |
| **🆗 ao lado do nome** | Jogadores marcados com `!pago` |
| **Marcação silenciosa de todos** | `!todos [mensagem]` notifica todos sem encher o texto de @nomes |

---

## 7. Referência de comandos

### Jogadores

| Comando | Descrição |
|---------|-----------|
| `!<lista> Seu Nome` | Entra na lista (ex.: `!ygo Lucas Chagas`). O comando aparece no fim de cada lista |
| `!sair [lista]` | Sai da lista; o nome da lista só é necessário se a pessoa estiver em mais de uma |
| `!meta [lista]` | Desafio da premiação |
| `!neymar` / `!ajudaney` | Menu de comandos (ADMs veem a parte de ADM) |

### ADM: listas

| Comando | Descrição |
|---------|-----------|
| `!lista #nome data hora vagas reservas [valor]` | Cria a lista; se já existir, abre uma nova edição (pede `!confirmar`) |
| `!lista #nome` | Mostra a lista (cria vazia se não existir) |
| `!lista` | Mostra a lista, ou o resumo se houver várias |
| `!listas` | Todas as listas abertas e o grupo onde cada uma foi criada |
| `!limparlista [lista]` | Zera inscritos, data, hora, meta e prêmios (pede `!confirmar`) |
| `!excluirlista [lista]` | Apaga a lista e o comando dela (pede `!confirmar`) |
| `!confirmar` | Confirma a ação pendente (válido por 2 min). `!confirmarlimpeza` também funciona |
| `!importarlegado #nome` | Importa a lista da versão antiga |
| `!todos [mensagem]` | Marca todos do grupo |

### ADM: ajustes (`[lista]` é opcional se só existir uma lista, ou uma criada no grupo)

| Comando | Descrição |
|---------|-----------|
| `!setdata [lista] data` | Data |
| `!sethora [lista] hora` | Horário |
| `!setvalor [lista] valor` | Valor (aceita com ou sem "R$") |
| `!settitulo [lista] título` | Título exibido no topo (padrão: nome da lista em maiúsculas) |
| `!setlocal [lista] endereço` | Local (padrão: endereço da loja) |
| `!setbase [lista] texto` | Premiação base (padrão: "Créditos em loja.") |
| `!vagas [lista] nº` | Vagas; ao aumentar, a fila de espera sobe |
| `!espera [lista] nº` | Reservas (fila de espera) |
| `!meta [lista] nº` | Meta de jogadores (`0` desativa) |
| `!premio1/2/3 [lista] prêmio` | Prêmios da meta |
| `!limparpremios [lista]` | Apaga os prêmios |

### ADM: jogadores

| Comando | Descrição |
|---------|-----------|
| `!add [lista] Nome` / `!add [lista] @pessoa [Nome]` | Adiciona alguém (não sai sozinho) |
| `!pago [lista] nº` / `!naopago [lista] nº` | Marca ou desmarca o 🆗 |
| `!alterar [lista] nº Nome` | Renomeia |
| `!remover [lista] nº` | Remove; o primeiro da espera sobe |
| `!vincular [lista] nº @pessoa` | Liga uma vaga ao WhatsApp da pessoa |

Use `e1`, `e2`… para posições da fila de espera.

### ADM: permissões (fora do menu: `!id`)

| Comando | Descrição |
|---------|-----------|
| `!addadm [ID, número ou @pessoa]` | Adiciona ADM |
| `!deladm [ID, número ou @pessoa]` | Remove ADM |
| `!admins` | Lista os ADMs |
| `!id [@pessoa]` | Mostra um ID (não aparece no menu) |

> O **número do bot** é sempre ADM. Use-o para cadastrar os primeiros ADMs: `!addadm @pessoa`.

### Comandos removidos

| Antes | Agora |
|-------|-------|
| `!ajuda`, `!comandos` | `!neymar`, `!ajudaney` |
| `!participar Nome` | `!<lista> Nome` |
| `!lista` (público) | Só ADM (`!lista #nome`) |
| `!confirmarlimpeza` | `!confirmar` (o antigo continua funcionando) |

---

## 8. Como instalar no computador do cliente

O passo a passo completo está no [README.md](README.md), na **Parte 2**. Em resumo:

1. Clonar a `master` numa **pasta nova**. A pasta do bot antigo não é alterada e serve para voltar atrás.
2. **Copiar** da pasta antiga para a nova os arquivos `dados_campeonato.json` (lista atual) e `config.json` (ADMs).
3. Parar o bot antigo, iniciar o novo e escanear o QR com o número da QB GeeK.
4. `!importarlegado #liga` para trazer a lista atual. O título "LIGA QB" é mantido, e quem tinha 🆗 fica marcado como pago. Na pasta nova, a cópia do arquivo vira `dados_campeonato.importado-<data>.json`.
5. Criar as outras listas com `!lista #nome data hora vagas reservas valor`.

> 🛑 **Não rode `git pull` na pasta do bot antigo.** A `master` agora tem o código novo.

---

## 9. Arquivos alterados

### Novos

| Arquivo | Função |
|---------|--------|
| [comandos/gestao.js](comandos/gestao.js) | `!lista`, `!listas`, `!limparlista`, `!excluirlista`, `!confirmar`, `!importarlegado` |
| [comandos/admins.js](comandos/admins.js) | `!addadm`, `!deladm`, `!admins` (saíram do `index.js`) |
| [utils/armazenamento.js](utils/armazenamento.js) | Leitura e gravação das listas globais em `dados/listas.json` (substitui `utils/dados.js`) |
| [utils/loja.js](utils/loja.js) | Endereço e premiação base padrão da loja |
| [utils/identidade.js](utils/identidade.js) | IDs `@c.us`/`@lid`, menções, nome do perfil |
| [utils/listas.js](utils/listas.js) | Adicionar, remover, promover da espera, quem pode sair, posições (`3`, `e1`) |
| [utils/formatacao.js](utils/formatacao.js) | Texto da lista no layout original |
| [utils/efeitos.js](utils/efeitos.js) | Marcação de promovidos e aviso de meta |
| [utils/confirmacoes.js](utils/confirmacoes.js) | `!confirmar` com prazo, por grupo |
| [utils/arquivoJson.js](utils/arquivoJson.js) | Leitura com backup e gravação segura |
| [utils/modoTeste.js](utils/modoTeste.js) | Modo teste: com `BOT_SOMENTE_GRUPO` definida, responde só nos grupos com esse nome |
| [utils/whatsapp.js](utils/whatsapp.js) | Lê nome e participantes do grupo sem o `getChat()` da biblioteca, que está quebrado |
| `README.md`, `ALTERACOES.md` | Documentação (o README tem o passo a passo de teste local e instalação para o cliente) |
| `AGENTS.md` | Contexto completo para próximos agentes de IA / desenvolvedores |
| [teste/simular.js](teste/simular.js) | Testes automáticos sem WhatsApp (`npm test`, 42 verificações) |

### Reescritos ou alterados

| Arquivo | O que mudou |
|---------|-------------|
| [index.js](index.js) | Só inicia o WhatsApp; código duplicado removido; tratamento de erro por mensagem |
| [comandos/index.js](comandos/index.js) | Tabela de comandos, checagem de ADM e grupo antes de executar, listas como comandos dinâmicos |
| [comandos/ajuda.js](comandos/ajuda.js) | Menu `!neymar`, dividido, sem `!id` |
| [comandos/participar.js](comandos/participar.js) | Chamado pelo comando da lista (`!ygo Nome`) |
| [comandos/sair.js](comandos/sair.js) | Escolhe a lista; bloqueia vaga paga ou adicionada pelo ADM |
| [comandos/gerenciarLista.js](comandos/gerenciarLista.js) | Novos `!pago` / `!naopago`; `e1` para a espera |
| Demais arquivos em [comandos/](comandos/) | Recebem a lista escolhida (`ctx.lista`); ajustes respondem numa linha |
| [utils/config.js](utils/config.js) | Caminho absoluto, leitura segura, `ehAdmin` |
| [utils/barraMeta.js](utils/barraMeta.js) | Retorno consistente sem meta |
| [package.json](package.json) | Script `npm start` |
| [.gitignore](.gitignore) | Ignora `dados/` e `dados_campeonato*.json` |

### Removidos

| Arquivo | Motivo |
|---------|--------|
| `comandos/lista.js` | `!lista` público removido; virou `!lista #nome` em `gestao.js` |
| `comandos/limpeza.js` | Incorporado a `gestao.js` |
| `utils/dados.js` | Substituído por `utils/armazenamento.js` |
| `dados_campeonato.json` | Removido **apenas do git**. Continua no servidor até ser importado |

---

## 10. Pontos de atenção

- **A hora não pode ter espaço** no comando único (`10h00AM`, não `10h00 AM`), porque o espaço separa os campos. Para hora com espaço, crie a lista e ajuste com `!sethora ygo 10h00 AM`.
- **`!add` com nome igual ao de uma lista**: em `!add cup Head`, a palavra "cup" é lida como o nome da lista. É raro; nesse caso use `!add cup Cup Head`.
- **Confirmações pendentes** (`!confirmar`) ficam só na memória: se o bot reiniciar, é preciso pedir de novo.
- **`!admins`** lista os IDs cadastrados, que podem conter números de telefone. Use de preferência no privado do bot.
- O bot usa o **whatsapp-web.js** (WhatsApp Web não oficial). Mudanças do WhatsApp podem exigir atualizar a biblioteca.
- **A pasta `.wwebjs_auth/` é a "chave" do WhatsApp conectado.** Quem tiver uma cópia dela consegue usar a conta enquanto o aparelho estiver conectado. Nunca compacte nem envie a pasta do projeto com ela dentro (o git já a ignora).
- **Alertas restantes do `npm audit`** (`basic-ftp`, `extract-zip` e dependentes): estão no `@puppeteer/browsers`, usado só para baixar o Chrome. Não são alcançáveis por mensagens do WhatsApp. A correção automática (`--force`) rebaixaria o whatsapp-web.js para 1.34.2, por isso não foi aplicada.
- **Testes já feitos:**
  - 20/10/2026: o desenvolvedor testou no WhatsApp real (modo teste), com tudo aprovado.
  - 21/10/2026: a mudança para listas globais foi validada só com os testes automáticos (`npm test`).
  - Faça o teste da Parte 1 do README antes de liberar.

# Alterações — branch `feat/multi-eventos`

Este documento lista tudo o que foi corrigido, alterado e adicionado no bot da QB Geek nesta branch, além dos passos para atualizar o servidor sem perder a lista atual.

## Resumo

1. **Correção de todos os erros identificados**: o principal é que qualquer pessoa conseguia executar comandos de ADM.
2. **Vários eventos ao mesmo tempo**: cada grupo do WhatsApp pode ter o seu evento (Magic em um grupo, Yu-Gi-Oh! em outro, Pokémon em outro), todos com a mesma estrutura e listas independentes.
3. **Lista sempre atualizada**: toda alteração faz o bot responder com a lista completa e atual.
4. **Emojis e efeitos**: reações nas mensagens, marcação de quem sobe da fila de espera, comemoração quando a meta é atingida, barra de progresso, aviso de vagas esgotadas.
5. **Quem foi adicionado por ADM agora consegue sair sozinho** (veja a seção específica).

---

## 1. Correções de erros

| # | Problema | Impacto | Correção |
|---|----------|---------|----------|
| 1 | Os comandos de ADM (`!add`, `!vagas`, `!remover`, `!limparlista`, `!confirmarlimpeza` etc.) eram executados **antes** de checar se a pessoa era ADM | Qualquer membro do grupo podia apagar a lista, remover jogadores ou mudar as vagas, e ainda recebia "Acesso negado" depois da ação | A permissão agora é verificada em um único lugar ([comandos/index.js](comandos/index.js)), **antes** de executar. Cada comando tem `admin: true/false` em uma tabela |
| 2 | Código duplicado em `index.js` chamava funções que não existiam (`comandoConfiguracao`, `comandoParticipar`, `comandoTodos`…) | Quase todo comando gerava um erro `ReferenceError` no log | Código removido; o `index.js` só inicia o WhatsApp e repassa as mensagens ao roteador |
| 3 | `!add` criava um ID falso (`ADM_<número>`) | A pessoa adicionada pelo ADM nunca conseguia usar `!sair` | `!add @pessoa` vincula a vaga; `!eusou` e `!vincular` resolvem as vagas antigas (seção 5) |
| 4 | O bot respondia comandos de campeonato em **qualquer conversa**, inclusive no privado | Alguém podia se inscrever pelo privado | Comandos de evento só funcionam em grupos com evento ativo |
| 5 | `!limparlista` zerava a quantidade de vagas sem avisar | Depois da limpeza, ninguém conseguia se inscrever até um ADM usar `!vagas` | A limpeza mantém vagas, espera, valor, título, local e premiação base; a mensagem de confirmação lista exatamente o que é apagado e o que é mantido |
| 6 | `dados_campeonato.json` (com nomes reais dos jogadores) estava no git | Dados pessoais versionados | Arquivo removido do git e adicionado ao `.gitignore`, junto com a nova pasta `dados/` |
| 7 | `!todos` passava as opções no lugar errado (`msg.reply(texto, { mentions })`) | O comando nunca funcionou, ninguém era marcado | Corrigido para `msg.reply(texto, undefined, { mentions })`; agora aceita mensagem: `!todos Começa às 19h!` |
| 8 | Se o JSON de dados corrompesse, o bot o **sobrescrevia** com dados vazios | Perda total da lista | Antes de seguir, o arquivo corrompido é copiado para `*.corrompido-<data>` |
| 9 | Gravação direta no arquivo | Uma queda durante a gravação podia deixar o JSON pela metade | Gravação em arquivo temporário seguida de renomeação ([utils/arquivoJson.js](utils/arquivoJson.js)) |
| 10 | Caminhos relativos (`./config.json`) | Se o bot fosse iniciado de outra pasta, criava arquivos no lugar errado | Caminhos baseados na pasta do projeto (`__dirname`) |
| 11 | `config.json` inválido derrubava o bot na inicialização | Bot não subia | Leitura protegida, com backup do arquivo inválido |
| 12 | `!id` era exclusivo de ADM e a lista de ADMs começava vazia | Não havia como cadastrar o primeiro ADM pelo WhatsApp | O próprio número do bot é sempre ADM; `!id` é público (mostra só o seu próprio ID) |
| 13 | Comandos eram reconhecidos por "começa com" (`!participarXYZ` funcionava como `!participar`) | Comportamento inesperado | O comando precisa ser a primeira palavra exata |
| 14 | `!meta 0` era recusado | Não dava para desligar a meta | `!meta 0` desativa a meta |
| 15 | A confirmação de limpeza era global e não expirava | Um ADM podia confirmar, horas depois, uma limpeza pedida em outro contexto | Confirmação por grupo, válida por 2 minutos |
| 16 | Aumentar as vagas (`!vagas`) não puxava ninguém da fila de espera | Quem estava esperando continuava esperando com vaga livre | Ao aumentar as vagas, a fila sobe automaticamente e quem subiu é marcado |
| 17 | `!alterar` e `!remover` só funcionavam na lista principal | Não era possível corrigir a fila de espera | Use `e1`, `e2`… para posições da fila (ex.: `!remover e1`) |
| 18 | O aviso "Mais de 30 segundos esperando o WhatsApp" aparecia sempre | Log confuso | O aviso é cancelado quando o bot fica pronto |
| 19 | O WhatsApp identifica a mesma pessoa por número (`@c.us`) ou por ID anônimo (`@lid`) | Um ADM podia não ser reconhecido, ou alguém podia não ser encontrado na lista ao usar `!sair` | O bot resolve as duas formas e compara ambas ([utils/identidade.js](utils/identidade.js)) |
| 20 | Erros em comandos ficavam sem resposta para o usuário | O usuário ficava sem saber se funcionou | Erros são registrados no log e o bot responde "Algo deu errado" |
| 21 | Nomes sem limite de tamanho | Uma mensagem gigante poluía a lista | Nomes limitados a 40 caracteres; textos de configuração a 120 |

---

## 2. Vários eventos ao mesmo tempo (um por grupo)

### Como funciona

- Cada **grupo** do WhatsApp pode ter **um evento ativo**.
- Os eventos são independentes: inscrever-se no grupo de Magic não interfere no de Yu-Gi-Oh!.
- Os **ADMs são globais**: quem é ADM, é ADM em todos os grupos.
- Todos os eventos têm **a mesma estrutura de configuração**; o que muda são os valores (título, emoji, data, vagas, prêmios…).

### Criando um evento

No grupo desejado, um ADM envia:

| Comando | Resultado |
|---------|-----------|
| `!criarevento pokemon` | ⚡ LIGA POKÉMON QB |
| `!criarevento magic` (ou `mtg`) | 🔮 LIGA MAGIC QB |
| `!criarevento yugioh` (ou `ygo`, `Yu-Gi-Oh!`) | 🐉 LIGA YU-GI-OH! QB |
| `!criarevento Torneio de One Piece` | 🎲 TORNEIO DE ONE PIECE (nome livre) |

Depois é só configurar com `!vagas`, `!espera`, `!setdata`, `!sethora` e `!setvalor`. O título pode ser trocado com `!settitulo`.

Para **adicionar um novo tipo fixo** (ex.: One Piece, Lorcana), basta incluir uma entrada em [utils/tiposEvento.js](utils/tiposEvento.js). Não é preciso mexer em mais nada.

### Estrutura de dados

Antes havia um único arquivo, `dados_campeonato.json`, com um campeonato. Agora existe `dados/eventos.json`, com um evento por grupo. Os nomes dos campos antigos foram mantidos e alguns foram adicionados:

```json
{
  "120363000000000000@g.us": {
    "tipo": "magic",
    "titulo": "LIGA MAGIC QB",
    "emoji": "🔮",
    "grupo": "Liga Magic QB Geek",
    "dataCamp": "01/09/2026",
    "horaCamp": "18h30",
    "valorEntrada": "20,00",
    "local": "R. da Hora, 345 - Loja 14 - Espinheiro, Recife - PE, 52020-010",
    "premiacaoBase": "Créditos em loja.",
    "limiteVagas": 16,
    "limiteEspera": 4,
    "metaPremiacao": 16,
    "premio1": "Booster Box",
    "premio2": "Não definido",
    "premio3": "Não definido",
    "inscritos": [
      { "nome": "Ana", "id": "123456789@lid", "ids": ["123456789@lid", "5581999999999@c.us"] }
    ],
    "listaEspera": []
  }
}
```

- **Campos novos**: `tipo`, `titulo`, `emoji`, `grupo`, `local`, `premiacaoBase`, `criadoEm`.
- **Jogador**: `ids` guarda todas as formas de ID da pessoa. Se estiver vazio, a vaga foi criada por um ADM e ainda não tem dono.

### Comandos novos de gestão de eventos (ADM)

- `!criarevento [tipo ou nome]`: cria o evento no grupo.
- `!encerrarevento` → `!confirmarencerramento`: apaga o evento do grupo.
- `!eventos`: lista os eventos ativos em todos os grupos (funciona também no privado do bot).
- `!importarlegado [tipo]`: importa a lista da versão antiga para o grupo atual (veja a seção 7).

---

## 3. Lista sempre atualizada

Toda vez que algo muda no evento, o bot responde **na mesma mensagem** com o que mudou e, logo abaixo, a lista completa. Isso vale para:

`!participar`, `!sair`, `!eusou`, `!add`, `!alterar`, `!remover`, `!vincular`, `!vagas`, `!espera`, `!meta N`, `!premio1/2/3`, `!limparpremios`, `!settitulo`, `!setdata`, `!sethora`, `!setvalor`, `!setlocal`, `!setbase`, `!criarevento`, `!importarlegado` e `!confirmarlimpeza`.

Exemplo de resposta a um `!participar Caio`:

```
✅ *Caio* está inscrito(a)! Boa sorte! 🍀

🔮 *LIGA MAGIC QB* 🔮
━━━━━━━━━━━━━━━━━━
🗓️ *Data:* 01/09/2026
⏰ *Horário:* 18h30
💰 *Entrada:* R$ 20,00
🎁 *Premiação base:* Créditos em loja.
📍 R. da Hora, 345 - Loja 14 - Espinheiro, Recife - PE, 52020-010
━━━━━━━━━━━━━━━━━━
🔥 *META DA SEMANA* 🔥

🟨🟨🟨🟨🟨🟨⬜⬜⬜⬜  *56%*
👥 9/16 jogadores

🚀 Faltam apenas *7 jogadores*!

🥇 Booster Box
🥈 Não definido
🥉 Não definido

_⚠️ A meta considera os jogadores presentes na QB GEEK._
━━━━━━━━━━━━━━━━━━
📋 *INSCRITOS (9/16)*

1. Ana
2. Bruno
...
10. _vaga livre_

🟢 *7 vagas disponíveis*
━━━━━━━━━━━━━━━━━━
✍️ Para entrar: *!participar Seu Nome*
```

---

## 4. Emojis e efeitos

| Efeito | Quando acontece |
|--------|-----------------|
| **Reação na mensagem** do usuário (✅ ⏳ 👋 🚫 🔗 ✏️ 🗑️ 📏 🔥 🥇 🧹 🎉 👑 🏁) | Confirma visualmente a ação sem precisar ler a resposta |
| **Emoji do jogo** no título (⚡ Pokémon, 🔮 Magic, 🐉 Yu-Gi-Oh!, 🎲 personalizado) | Em toda lista e mensagem do evento |
| **Marcação (@)** de quem sobe da fila de espera | Quando alguém sai, é removido ou as vagas aumentam |
| **Mensagem de comemoração** 🎉🎊🎉 | No momento exato em que a meta de jogadores é atingida |
| **Barra de progresso** 🟥/🟨/🟩 com porcentagem | Na lista e no `!meta` |
| **"Essa foi a última vaga — lista completa!"** e 🔒 *Vagas esgotadas* | Quando a lista principal lota |
| **🟢 X vagas disponíveis** | Enquanto houver vaga |
| **Marcação silenciosa** de todos | `!todos [mensagem]`: notifica todos sem encher o texto de @nomes |

---

## 5. Pessoas adicionadas pelo ADM podem se remover?

**Antes: não.** O `!add` guardava um ID inventado (`ADM_1788287983093`) e o `!sair` procura a pessoa pelo ID real do WhatsApp, então os dois nunca batiam.

**Agora: sim.** Há três caminhos:

1. **`!add @pessoa`** (recomendado): o ADM marca a pessoa no lugar de digitar o nome. A vaga já nasce vinculada ao WhatsApp dela e ela pode usar `!sair` normalmente. O nome vem do perfil do WhatsApp ou pode ser informado: `!add @pessoa Nome`.
2. **`!eusou [nº]`** (o jogador faz sozinho): se o ADM usou `!add Nome` sem marcar, a própria pessoa envia `!eusou 3` (ou `!eusou e1` na fila de espera) para assumir a vaga. Depois disso, `!sair` funciona. O bot sugere esse comando automaticamente ao adicionar alguém sem marcação.
3. **`!vincular [nº] @pessoa`** (o ADM faz): liga uma vaga existente a uma pessoa. Serve para corrigir vínculos ou para quem não sabe usar o `!eusou`.

**Proteções:**
- O `!eusou` só funciona em vagas **sem dono**. Vagas já vinculadas exigem um ADM.
- Ninguém pode ocupar duas posições.
- O bot anuncia no grupo, marcando a pessoa, quem assumiu qual vaga. Assim, um uso indevido fica visível e o ADM pode corrigir com `!vincular`.

> Os 14 inscritos da lista atual foram todos adicionados por `!add`. Depois da importação (seção 7), cada um pode enviar `!eusou [nº]` para poder sair sozinho.

---

## 6. Referência de comandos

### Jogadores

| Comando | Descrição |
|---------|-----------|
| `!participar [Nome]` | Entra na lista (ou na fila de espera). Sem nome, usa o nome do perfil do WhatsApp |
| `!lista` | Mostra a lista atual |
| `!sair` | Sai da lista; o primeiro da espera sobe |
| `!eusou [nº]` | **Novo.** Assume uma vaga criada por ADM (`!eusou 3`, `!eusou e1`) |
| `!meta` | Mostra o desafio de premiação |
| `!id` | Mostra o seu ID |
| `!ajuda` / `!comandos` | Menu (ADMs veem os comandos extras) |

### ADM: eventos

| Comando | Descrição |
|---------|-----------|
| `!criarevento [pokemon \| magic \| yugioh \| nome livre]` | **Novo.** Cria o evento do grupo |
| `!encerrarevento` → `!confirmarencerramento` | **Novo.** Encerra o evento do grupo |
| `!eventos` | **Novo.** Eventos ativos em todos os grupos |
| `!importarlegado [tipo]` | **Novo.** Importa a lista da versão antiga |

### ADM: configuração

| Comando | Descrição |
|---------|-----------|
| `!settitulo [título]` | **Novo.** Título do evento |
| `!setdata [data]` | Data |
| `!sethora [hora]` | Horário |
| `!setvalor [valor]` | Valor de entrada (aceita com ou sem "R$") |
| `!setlocal [endereço]` | **Novo.** Local (padrão: endereço da loja) |
| `!setbase [texto]` | **Novo.** Premiação base (padrão: "Créditos em loja.") |
| `!vagas [nº]` | Vagas; ao aumentar, a fila de espera sobe |
| `!espera [nº]` | Tamanho da fila de espera |
| `!meta [nº]` | Meta de jogadores (`0` desativa) |
| `!premio1/2/3 [prêmio]` | Prêmios da meta |
| `!limparpremios` | Apaga os prêmios |

### ADM: lista

| Comando | Descrição |
|---------|-----------|
| `!add [Nome]` / `!add @pessoa [Nome]` | Adiciona alguém; com @ a pessoa pode sair sozinha |
| `!alterar [nº] [Nome]` | Renomeia (`e1` para a fila de espera) |
| `!remover [nº]` | Remove (`e1` para a fila de espera) |
| `!vincular [nº] @pessoa` | **Novo.** Liga uma vaga a uma pessoa |
| `!limparlista` → `!confirmarlimpeza` | Reinicia o evento (confirmação válida por 2 min) |
| `!todos [mensagem]` | Marca todos do grupo (estava quebrado, corrigido) |

### ADM: permissões

| Comando | Descrição |
|---------|-----------|
| `!addadm [ID, número ou @pessoa]` | Adiciona ADM (agora aceita marcação e número de telefone) |
| `!deladm [ID, número ou @pessoa]` | Remove ADM |
| `!admins` | **Novo.** Lista os ADMs |

> O **número do bot** é sempre ADM. Use-o para cadastrar os primeiros ADMs: `!addadm @pessoa`.

---

## 7. Como atualizar o servidor

> ⚠️ **Faça backup antes.** O arquivo `dados_campeonato.json` saiu do git. Dependendo do estado do servidor, o `git` pode apagá-lo ou se recusar a atualizar.

1. **Pare o bot.**
2. **Faça backup**, copiando para fora da pasta do projeto:
   - `dados_campeonato.json`
   - `config.json`
3. Atualize o código:
   ```bash
   git fetch
   git checkout feat/multi-eventos
   ```
   - Se o git reclamar de alterações locais em `dados_campeonato.json`, mova o arquivo para fora da pasta, rode o `checkout` e traga-o de volta.
   - Se o arquivo sumir depois do `checkout`, restaure a cópia do backup.
4. `npm install` (não há dependências novas; só garante que está tudo instalado).
5. Inicie com `npm start` (ou `node index.js`). A sessão do WhatsApp (`.wwebjs_auth/`) é mantida, então **não é preciso ler o QR code de novo**.
6. **No grupo do campeonato atual**, um ADM envia:
   - `!importarlegado pokemon`: importa como ⚡ LIGA POKÉMON QB; ou
   - `!importarlegado`: importa mantendo o nome antigo, 🏆 LIGA QB.

   O arquivo antigo é renomeado para `dados_campeonato.importado-<data>.json`, que fica como backup.
7. Nos outros grupos, crie os eventos com `!criarevento magic`, `!criarevento yugioh` etc.

Os ADMs do `config.json` atual continuam valendo.

---

## 8. Arquivos alterados

### Novos

| Arquivo | Função |
|---------|--------|
| [comandos/admins.js](comandos/admins.js) | `!addadm`, `!deladm`, `!admins` (saíram do `index.js`) |
| [comandos/evento.js](comandos/evento.js) | Criar, encerrar, listar e importar eventos |
| [utils/eventos.js](utils/eventos.js) | Leitura e gravação de `dados/eventos.json` (substitui `utils/dados.js`) |
| [utils/tiposEvento.js](utils/tiposEvento.js) | Tipos de evento (Pokémon, Magic, Yu-Gi-Oh!) e dados da loja |
| [utils/identidade.js](utils/identidade.js) | Resolução de IDs `@c.us`/`@lid`, menções, nome do perfil |
| [utils/listas.js](utils/listas.js) | Adicionar, remover, promover da espera, posições (`3`, `e1`) |
| [utils/formatacao.js](utils/formatacao.js) | Montagem da lista e textos comuns |
| [utils/efeitos.js](utils/efeitos.js) | Marcação de promovidos e comemoração da meta |
| [utils/confirmacoes.js](utils/confirmacoes.js) | Confirmações com prazo, por grupo |
| [utils/arquivoJson.js](utils/arquivoJson.js) | Leitura com backup de arquivo corrompido e gravação segura |
| `ALTERACOES.md` | Este documento |

### Reescritos ou alterados

| Arquivo | O que mudou |
|---------|-------------|
| [index.js](index.js) | Ficou só com a inicialização do WhatsApp; código duplicado e quebrado removido; tratamento de erro por mensagem |
| [comandos/index.js](comandos/index.js) | Roteador baseado em tabela, com checagem de ADM, grupo e evento **antes** de executar |
| Todos os arquivos em [comandos/](comandos/) | Recebem o contexto do grupo (`ctx`), respondem com a lista atualizada e usam reações |
| [utils/config.js](utils/config.js) | Caminho absoluto, leitura segura, função `ehAdmin` |
| [utils/barraMeta.js](utils/barraMeta.js) | Retorno consistente quando não há meta |
| [package.json](package.json) | Script `npm start` e descrição |
| [.gitignore](.gitignore) | Ignora `dados/` e `dados_campeonato*.json` |

### Removidos

| Arquivo | Motivo |
|---------|--------|
| `utils/dados.js` | Substituído por `utils/eventos.js` |
| `dados_campeonato.json` | Removido **apenas do git** (dados pessoais). Continua existindo no servidor até ser importado |

---

## 9. Pontos de atenção

- **Confirmações pendentes** (`!limparlista`, `!encerrarevento`) ficam só na memória: se o bot reiniciar, é preciso pedir de novo.
- **`!eusou` depende de boa-fé**: qualquer pessoa pode assumir uma vaga **sem dono**. O anúncio público com marcação torna o abuso visível e o ADM corrige com `!vincular`. Para eliminar o risco, use sempre `!add @pessoa`.
- **`!id` em grupos** mostra o ID como o WhatsApp o exibe naquele grupo (normalmente `@lid`, que não expõe o telefone). `!admins` lista os IDs cadastrados, que podem conter números de telefone; use de preferência no privado do bot.
- O bot continua usando o **whatsapp-web.js** (WhatsApp Web não oficial). Mudanças do WhatsApp podem exigir atualizar a biblioteca.

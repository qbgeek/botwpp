# Contexto para agentes de IA

Leia este arquivo inteiro antes de mexer no projeto. Ele resume o que o bot faz, como está construído, o que foi decidido com o cliente, como testar e o que falta.

---

## 1. Regras obrigatórias

1. **Nada pode creditar ferramentas de IA.** Sem `Co-Authored-By`, sem "Generated with…", nem em commits, PRs, documentos ou comentários. O autor dos commits é o usuário git configurado (`rafael`).
2. **Não abra PR nem altere a `master` sem pedido explícito.** A `master` tem a versão atual (o merge de `feat/multi-eventos` foi pedido pelo Rafael em 21/10/2026). A versão antiga está preservada na branch `projeto-legado` e **não deve ser alterada**.
3. **Nunca conecte o número da empresa (QB GeeK) fora do servidor de produção.** Dois bots no mesmo número respondem em dobro nos grupos.
4. **Testes com WhatsApp real usam outro número e o modo teste** (`BOT_SOMENTE_GRUPO`, seção 6). Ao terminar, desvincule o aparelho (`client.logout()`) e apague `.wwebjs_auth/`.
5. **Dados pessoais**: `dados/`, `config.json`, `dados_campeonato*.json` e `.wwebjs_auth/` nunca vão para o git (já estão no `.gitignore`).
6. Idioma do código, das mensagens do bot e da documentação: **português do Brasil**.

---

## 2. O projeto

- **Cliente:** QB Geek, loja de card games em Recife (R. da Hora, 345 - Loja 14 - Espinheiro). Contato: Artur Rodrigues, ADM dos grupos.
- **Dono do projeto:** Rafael Varela (desenvolvedor contratado).
- **O que o bot faz:** gerencia listas de inscrição de campeonatos (Pokémon, Yu-Gi-Oh!, Magic etc.) em grupos de WhatsApp. O ADM cria listas com nome livre (`!lista #ygo …`) e cada nome vira o comando de inscrição (`!ygo Nome`), válido em **todos os grupos** do bot. Há fila de espera, marcação de pago (🆗), meta de premiação e avisos.
- **Repositório:** `https://github.com/qbgeek/botwpp`
  - `master`: versão nova (todo o trabalho descrito aqui).
  - `projeto-legado`: versão antiga (commit `e54d45c`). A pasta do bot antigo continua no computador do cliente como plano de volta.
  - `feat/multi-eventos`: branch onde o trabalho foi feito; mantida como histórico.

## 3. Stack

| Peça | Detalhe |
|---|---|
| Node.js (CommonJS, `require`) | Testado no Node 24 |
| `whatsapp-web.js` 1.34.7 | Controla o WhatsApp Web via Puppeteer (Chrome headless). **Não é a API oficial** |
| `qrcode-terminal` | QR de login no terminal |
| `LocalAuth` | Sessão salva em `.wwebjs_auth/` |
| Persistência | Arquivos JSON (`dados/listas.json`, `config.json`), gravação atômica |
| Testes | `npm test` (`teste/simular.js`), sem WhatsApp |

## 4. Arquitetura

```
index.js                 Inicia o WhatsApp; message_create -> modo teste -> executarComando
comandos/index.js        Roteador: tabela COMANDOS, checagem de ADM/escopo ANTES de executar,
                         resolução da lista pelo 1º argumento, listas como comandos dinâmicos
comandos/gestao.js       !lista (criar/ver/recomeçar), !listas, !limparlista, !excluirlista,
                         !confirmar, !importarlegado
comandos/participar.js   Inscrição via comando da lista (!ygo Nome)
comandos/sair.js         !sair [lista]; bloqueia vaga paga ou adicionada por ADM
comandos/add.js          !add [lista] Nome | @pessoa
comandos/gerenciarLista.js  !pago, !naopago, !alterar, !remover, !vincular
comandos/configuracao.js !setdata, !sethora, !setvalor, !settitulo, !setlocal, !setbase
comandos/vagas.js        !vagas (promove a fila de espera), !espera
comandos/meta.js         !meta (público) e !meta N (ADM)
comandos/premios.js      !premio1/2/3, !limparpremios
comandos/todos.js        !todos [mensagem]: "@all" no texto + menções ocultas + nonJidMentions (só ADM)
comandos/ajuda.js        !neymar / !ajudaney
comandos/admins.js       !addadm, !deladm, !admins
comandos/id.js           !id (ADM, fora do menu)
utils/armazenamento.js   Listas globais em dados/listas.json, normalização, migração do legado
utils/listas.js          Operações nos jogadores (adicionar, remover, promover, posições e1)
utils/formatacao.js      Texto da lista no layout original do cliente
utils/efeitos.js         Marcação de promovidos, aviso de meta
utils/identidade.js      IDs @c.us/@lid, menções, nome do perfil
utils/whatsapp.js        Lê nome/participantes do grupo SEM msg.getChat() (ver seção 8)
utils/modoTeste.js       BOT_SOMENTE_GRUPO: responde só nos grupos com esse nome
utils/confirmacoes.js    Ações pendentes de !confirmar (por grupo, expiram em 2 min)
utils/config.js          config.json (ADMs) e ehAdmin()
utils/arquivoJson.js     Leitura com backup de arquivo corrompido; gravação atômica
utils/loja.js            Endereço e premiação base padrão
utils/barraMeta.js       Barra de progresso 🟥🟨🟩
teste/simular.js         48 verificações sem WhatsApp, numa cópia temporária do código
```

**Fluxo de uma mensagem:** `message_create`, depois `modoTeste.foraDoTeste`, depois `executarComando`. O roteador:
1. ignora o que não começa com `!`;
2. procura o comando na tabela ou, se não achar, uma lista do grupo com aquele nome;
3. resolve os IDs do autor;
4. checa se é ADM e o escopo;
5. resolve a lista e chama o comando com `ctx`.

O `ctx` contém `msg`, `client`, `nome`, `args`, `chatId`, `ehGrupo`, `idUsuario`, `idsUsuario`, `ehAdm`, `lista`, `salvar()`, `responder()`, `responderComLista()`, `reagir()` e `comandoExiste()`.

**Regras de negócio importantes:**
- **ADM:** o número do bot (`msg.fromMe`) é sempre ADM; os demais ficam em `config.json` (`!addadm`).
- **Listas são globais:** valem em todos os grupos do bot, inclusive grupos criados depois (pedido do cliente). O nome é único no bot inteiro. A chave é normalizada sem acento e em minúsculas (`!MESÃO` = `!mesao`). Nome de comando do bot não pode virar lista. A busca usa `Object.hasOwn`, por causa do caso `constructor`. Cada lista guarda `grupoOrigem` e `nomeGrupoOrigem`.
- **Onde cada comando funciona:** a inscrição (`!ygo Nome`) só em grupos. Os comandos de ADM sobre listas funcionam em grupos e no privado do bot. O `!todos` só em grupos.
- **Nome da lista nos comandos de ADM:** é o 1º argumento (`!vagas ygo 28`). É opcional se existir uma lista só, ou se só uma lista tiver `grupoOrigem` igual ao chat atual (`resolverLista` em `comandos/index.js`).
- **Quando o bot mostra a lista inteira:** só quando muda gente nela. Ajustes de configuração respondem numa linha. A lista mostra apenas até o último nome.
- **Quem sai sozinho:** quem está pago (`pago`) ou foi adicionado por ADM (`adicionadoPorAdm`) **não** usa `!sair`; só um ADM remove.
- **Fila de espera:** ao aumentar `!vagas`, ela sobe automaticamente e quem sobe é marcado com @.

**Formato do jogador:** `{ nome, id, ids: [@lid, @c.us], pago, adicionadoPorAdm }`.

## 5. Decisões tomadas com o cliente

Os pedidos vieram por WhatsApp. Estas são as decisões aprovadas pelo Rafael:

| Pedido / decisão | Implementação |
|---|---|
| Comandos de ADM só para ADM; menu dividido | Roteador checa antes; `!neymar` mostra a parte de ADM só a ADMs |
| `!ajuda`/`!comandos` passam a ser `!neymar` (e `!ajudaney`) | Os antigos não respondem. Título do menu: "🤖 *COMANDOS CYBERNEMAR 100% QB*" |
| `!todos` marca todos do grupo onde foi dado, só se for ADM, com um único @all | Texto + `@all`; menções ocultas de todos (garantem a notificação) + `extra: { nonJidMentions: 1 }` para o @all nativo, com reenvio sem o campo se o WhatsApp Web recusar |
| Tirar `!id` do menu | Virou comando só de ADM, fora do menu |
| Listas criadas pelo ADM: `!lista #ygo`; inscrição `!ygo Nome` | Listas dinâmicas |
| Comandos funcionando em qualquer grupo (o cliente vai criar grupos novos) | Listas globais (21/10/2026); antes eram por grupo. O formato antigo de `dados/listas.json` é convertido ao carregar |
| Listas previstas: GLC, YGO, MESÃO, CUP, PRERELEASE, CHALLENGE, PREMIERE | Qualquer nome; não aparecem no menu |
| Criar com data/hora/valor num comando só | `!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00`: valor por último, aceita espaços e vírgulas; recriar = nova edição com `!confirmar` |
| Mostrar a lista ao se inscrever, só até o último nome, no layout original | `formatacao.js` replica o layout do cliente |
| Acabar com o spam do `!lista` | `!lista` é só de ADM; não-ADM recebe só a reação 🔒 |
| `!pago 14` coloca 🆗 | `!pago`/`!naopago`; o 🆗 digitado no legado vira `pago` na importação |
| `!add` é para listas pagas antecipadamente | Adicionado por ADM não sai sozinho; `!eusou` foi **removido** |
| Sistema de avaliação/denúncia (`$avaliar`) | **Descartado pelo próprio cliente** |

O histórico completo de alterações e a referência de comandos estão em `ALTERACOES.md`.

## 6. Como testar

### Sem WhatsApp (sempre, antes de qualquer commit)
```bash
npm test
```
O teste roda numa cópia temporária, então não toca nos dados do projeto. Ao mudar um comportamento, **atualize e amplie** `teste/simular.js`.

### Com WhatsApp real (validação final)
1. Use um número que não seja o da empresa e crie os grupos `Teste Bot QB` e `Teste Bot QB 2` com mais uma pessoa.
2. Inicie com `BOT_SOMENTE_GRUPO="Teste Bot QB,Teste Bot QB 2" npm start`. No PowerShell: `$env:BOT_SOMENTE_GRUPO="…"; npm.cmd start`.
3. Confira a linha `🧪 MODO TESTE` no início. Com ela, o bot registra `📩 Comando recebido` / `✅ … processando` / `🧪 Ignorado` para cada comando.
4. Para encerrar: `client.logout()`, que desvincula o aparelho no celular, e depois apague `.wwebjs_auth/`, `.wwebjs_cache/`, `dados/` e `config.json`.

**Diagnóstico avançado:** com o bot rodando, o Chrome expõe a porta de depuração em `.wwebjs_auth/session/DevToolsActivePort`. Dá para usar `puppeteer.connect` e `page.evaluate` para inspecionar `window.require('WAWebCollections')`. Use **só para leitura** e com autorização do dono do número.

### Validação já feita
- **20/10/2026:** o Rafael testou todos os blocos com o número pessoal em modo teste, e todos passaram. A sessão foi desvinculada via `logout`, e todos os resíduos foram apagados.
- **21/10/2026:** a mudança para listas globais foi validada só com `npm test` (42 verificações). **Ainda não foi testada no WhatsApp real.**

## 7. Estado atual e próximos passos

**Pronto na `master`:** tudo da seção 5, mais as correções listadas em `ALTERACOES.md` (seção 2, itens 1 a 27).

**Em produção (21/10/2026):**
- O bot novo roda no computador do cliente, em `C:\Users\loja\Desktop\BOT QBGEEK v2\botwpp`, clonado da `master`, já com listas criadas pelo cliente.
- A pasta do bot antigo continua no PC, intocada.
- Atualizações chegam por `git pull origin master` (rotina em `STACK.md`).

**Documentação:**
- `README.md`: só comandos (para o cliente).
- `STACK.md`: parte técnica (stack, instalação, teste, atualização, backup).
- `ALTERACOES.md`: histórico.

**Falta fazer:**
1. Confirmar com o Rafael se a lista antiga já foi importada (`!importarlegado #nome`).
2. Conferir no WhatsApp real se o `@all` nativo do `!todos` aparece destacado (seção 8).
3. Acompanhar atualizações do `whatsapp-web.js`. Ao atualizar, rode `npm test` e verifique se `msg.getChat()` voltou a funcionar (seção 8).

## 8. Problemas conhecidos e armadilhas

| Problema | Situação |
|---|---|
| **`msg.getChat()` / `client.getChatById()` quebrados** no whatsapp-web.js 1.34.7 com o WhatsApp Web atual: `getChatModel` chama `Msg.getMessagesById`, que lança "No key or key range specified" | Contornado em `utils/whatsapp.js` (`lerChat`). **Não use `getChat()` em código novo** |
| O WhatsApp identifica pessoas por `@lid` e `@c.us` | `resolverIds` (via `client.getContactLidAndPhone`) guarda os dois; compare sempre por `ids` |
| `--no-sandbox` no Chrome | Só no Linux (root/Docker); no Windows o sandbox fica ligado |
| A hora no comando único não pode ter espaço (`10h00 AM`) | Documentado; usar `!sethora` |
| `!add Cup Head` numa lista "cup" lê "Cup" como nome da lista | Documentado; usar `!add cup Cup Head` |
| Confirmações pendentes ficam só em memória | Somem se o bot reiniciar (aceitável) |
| `npm audit`: 9 alertas na cadeia `@puppeteer/browsers` (basic-ftp, extract-zip) | Só usados para baixar o Chrome; o `--force` rebaixaria o whatsapp-web.js |
| PowerShell bloqueia `npm`/`npx` (`.ps1`) | Usar `npm.cmd` / `npx.cmd` |
| Usar biblioteca não oficial viola os termos do WhatsApp | Risco pequeno de restrição do número |
| `@all` nativo do `!todos` (`extra: { nonJidMentions: 1 }`) | **Não validado no WhatsApp real.** O campo vem de implementações da comunidade (Baileys). Se o WhatsApp Web ignorar, "@all" aparece como texto comum, mas as menções ocultas continuam notificando todos. Em grupos com mais de 32 membros, o WhatsApp só permite @all a admins do grupo |

## 9. Convenções de código

- Indentação de 4 espaços, linhas em branco generosas entre blocos (estilo do autor original), CommonJS.
- Nomes de variáveis e funções em português (`lista`, `jogador`, `inscritos`, `limiteVagas`…). **Mantenha os nomes de campos do JSON**, porque o legado depende deles.
- Comentários curtos em português, explicando o porquê.
- Todo comando novo entra na tabela `COMANDOS` de `comandos/index.js` com `escopo` e `admin`; nunca cheque permissão dentro do comando, exceto em casos mistos como o `!meta`.
- Mensagens do bot com emoji no início e negrito do WhatsApp (`*texto*`). Respostas nunca podem começar com `!`, porque o bot lê as próprias mensagens.

## 10. Histórico de commits (feitos em `feat/multi-eventos`, hoje na `master`)

| Commit | Data | Resumo |
|---|---|---|
| `8bb3cde` | 16/10/2026 | Correções de permissão, eventos por grupo (primeira versão) |
| `f7fab5a` | 16/10/2026 | README com instruções de atualização |
| `a3bb40d` | 16/10/2026 | Listas com nome livre, comando único, `!pago`, `!neymar` |
| `9f25f18` | 19/10/2026 | Modo teste (`BOT_SOMENTE_GRUPO`) |
| `4fc1a63` | 20/10/2026 | Sandbox do Chrome, `Object.hasOwn`, `npm audit fix` |
| `17283df` | 20/10/2026 | Contorno do `getChat()` quebrado |
| `9f0e1ee` | 20/10/2026 | `npm test`, `AGENTS.md`, README para o cliente |
| `50ffd69` | 21/10/2026 | Listas globais (valem em qualquer grupo), ADM pelo privado, instalação em pasta nova |
| `64543c1`, `e5c1ffb` | 21/10/2026 | `!todos` com @all, título "CYBERNEMAR 100% QB" no menu, aviso de timer em reconexões |
| (este) | 21/10/2026 | README só com comandos; parte técnica em `STACK.md` |

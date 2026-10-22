# ⚙️ Stack, instalação e manutenção

Este arquivo cobre a parte técnica do bot da QB Geek: tecnologia, onde ficam os dados, como instalar, testar, atualizar e fazer backup.

Os comandos do bot estão no [README.md](README.md).

---

## Stack

| Peça | Para que serve |
|---|---|
| **Node.js** (CommonJS) | Executa o bot |
| **[whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)** 1.34.7 | Controla o WhatsApp Web por um Chrome invisível (Puppeteer). **Não é a API oficial do WhatsApp** |
| **qrcode-terminal** | Mostra o QR code de login no terminal |
| **LocalAuth** | Guarda a sessão do WhatsApp em `.wwebjs_auth/`, para não pedir QR a cada início |
| **Arquivos JSON** | Fazem o papel de banco de dados (ver [Onde ficam os dados](#onde-ficam-os-dados)) |
| **`npm test`** | Testes automáticos que simulam o WhatsApp (`teste/simular.js`) |

Não há servidor web, banco de dados nem serviço externo. É um processo Node que fica rodando no computador da loja.

## Estrutura de pastas

```
index.js            # inicia o WhatsApp e repassa as mensagens
comandos/index.js   # tabela de comandos, checagem de ADM, listas como comandos (!ygo)
comandos/*.js       # um arquivo por assunto (gestao, participar, sair, vagas, todos...)
utils/              # armazenamento, jogadores, formatação da lista, leitura do WhatsApp, modo teste
teste/simular.js    # testes automáticos (npm test)
README.md           # comandos do bot
STACK.md            # este arquivo
ALTERACOES.md       # histórico de tudo o que mudou
AGENTS.md           # contexto completo para desenvolvedores e agentes de IA
```

## Onde ficam os dados

Os dados ficam **só no computador onde o bot roda**. Nenhum deles vai para o GitHub (estão no `.gitignore`), e um `git pull` não mexe neles.

| Arquivo | Conteúdo |
|---|---|
| `dados/listas.json` | Todas as listas e inscritos |
| `config.json` | Os ADMs |
| `.wwebjs_auth/` | Sessão do WhatsApp. **É a "chave" da conta: nunca compartilhe** |
| `dados_campeonato.json` | Lista da versão antiga, usada só no `!importarlegado` |

> ⚠️ O repositório no GitHub é **público**. Por isso nomes, telefones e a sessão nunca devem ser enviados para lá.

## Branches no GitHub

| Branch | Conteúdo |
|---|---|
| `master` | Versão atual |
| `projeto-legado` | Versão antiga do bot (não alterar) |
| `feat/multi-eventos` | Onde o trabalho novo foi feito (histórico) |

---

## Pré-requisitos

| Item | Onde |
|---|---|
| **Node.js LTS** | <https://nodejs.org>, instalar com as opções padrão |
| **Git** | <https://git-scm.com/download/win>, instalar com as opções padrão |

Para conferir, abra o PowerShell e rode `node -v` e `git --version`. Os dois devem mostrar uma versão.

> 💡 **No PowerShell, use sempre `npm.cmd` (e `pm2.cmd`).** O Windows costuma bloquear o `npm` com o erro "a execução de scripts foi desabilitada neste sistema". A versão `.cmd` funciona igual.
>
> 💡 **Caminho com espaços vai entre aspas:** `cd "C:\Users\loja\Desktop\BOT QBGEEK v2\botwpp"`.

---

## Teste local (sem mexer nos grupos reais)

> ⚠️ **Nunca use o número da QB GeeK no teste.** O mesmo número conectado em dois lugares responde tudo em dobro.

1. **Baixe e instale numa pasta só para o teste:**
   ```powershell
   git clone https://github.com/qbgeek/botwpp.git C:\bot-teste
   cd C:\bot-teste
   npm.cmd install
   npm.cmd test
   ```
   O teste deve terminar com **`✅ 48 testes aprovados.`**

2. **Crie os grupos de teste:** com um WhatsApp que **não seja** o da QB GeeK, crie os grupos `Teste Bot QB` e `Teste Bot QB 2`, com mais uma pessoa.

3. **Inicie em modo teste:**
   ```powershell
   $env:BOT_SOMENTE_GRUPO="Teste Bot QB,Teste Bot QB 2"; npm.cmd start
   ```
   Confira a linha `🧪 MODO TESTE: só responde nos grupos …`. **Se ela não aparecer, aperte Ctrl+C.**

4. **Conecte o número de teste:** escaneie o QR em **Configurações → Aparelhos conectados → Conectar um aparelho** e espere `🏆 BOT DA QB ONLINE!`.

5. **Teste os comandos do [README.md](README.md)** no grupo `Teste Bot QB`.

6. **Encerre e apague tudo:**
   1. Pare o bot com Ctrl+C.
   2. No celular de teste, vá em **Aparelhos conectados** e desconecte o bot.
   3. Apague a pasta:
      ```powershell
      Remove-Item -Recurse -Force C:\bot-teste
      ```

### Modo teste

Com a variável `BOT_SOMENTE_GRUPO` definida, o bot **só responde nos grupos com esses nomes** (separados por vírgula) e ignora todo o resto, inclusive conversas privadas. Para cada comando, o terminal mostra:
- `📩 Comando recebido`;
- `✅ … processando` (grupo de teste) ou `🧪 Ignorado` (outro chat).

**Em produção, não defina essa variável.** Abra uma janela nova do PowerShell, ou rode `Remove-Item Env:BOT_SOMENTE_GRUPO`.

---

## Instalação definitiva

O bot novo vai numa **pasta nova**. A pasta do bot antigo **não é alterada** e serve para voltar atrás.

> 🛑 **Os dois bots nunca podem rodar ao mesmo tempo** com o número da QB GeeK.
>
> 🛑 **Não rode `git pull` na pasta do bot antigo.**

1. **Baixe e instale:**
   ```powershell
   git clone https://github.com/qbgeek/botwpp.git C:\bot-qb
   cd C:\bot-qb
   npm.cmd install
   npm.cmd test
   ```

2. **Pare o bot antigo** (Ctrl+C na janela dele, ou `pm2.cmd stop all`).

3. **Copie 2 arquivos** da raiz da pasta antiga (ao lado do `index.js` antigo) para a pasta nova:

   | Arquivo | Conteúdo |
   |---|---|
   | `dados_campeonato.json` | Lista atual |
   | `config.json` | ADMs |

   **Não copie a pasta `.wwebjs_auth`.** Se não souber onde fica a pasta antiga, procure:
   ```powershell
   Get-ChildItem $env:USERPROFILE -Filter dados_campeonato.json -Recurse -ErrorAction SilentlyContinue | Select-Object FullName, LastWriteTime
   ```
   O certo é o resultado com o `LastWriteTime` mais recente.

4. **Inicie numa janela nova do PowerShell** (sem modo teste):
   ```powershell
   cd C:\bot-qb
   npm.cmd start
   ```
   Escaneie o QR com o celular da **QB GeeK** e espere `🏆 BOT DA QB ONLINE!`.

5. **Importe a lista atual:** pelo celular da QB GeeK, num grupo, mande `!importarlegado #liga`. As listas criadas antes continuam como estão.

6. **Avise a galera** sobre os comandos novos (ver "Comandos que mudaram" no [README.md](README.md)).

**Para voltar ao bot antigo:**
1. Pare o novo.
2. Na pasta antiga, rode `npm.cmd start`.

As inscrições feitas no bot novo não voltam para o antigo.

---

## Atualizar o bot

As listas, os ADMs e a sessão **não são afetados** pelo `git pull`.

```powershell
cd "C:\caminho\do\bot"

# 1. Backup (ver abaixo)

# 2. Pare o bot (Ctrl+C, ou: pm2.cmd stop bot-qb)

# 3. Atualize e confira
git pull origin master
npm.cmd install
npm.cmd test

# 4. Inicie de novo
npm.cmd start
```

- **Se o `npm.cmd test` falhar, não inicie o bot.** Volte ao código anterior com `git reset --hard HEAD@{1}` (isso não mexe nas listas).
- **Ninguém deve editar código direto no computador da loja.** Toda mudança vai para a `master` e chega por `git pull`.

## Backup e restauração

**Para fazer o backup**, rode a qualquer momento, sem parar o bot:
```powershell
$bot = "C:\caminho\do\bot"
$destino = "$env:USERPROFILE\Desktop\backup-bot\$(Get-Date -Format 'yyyy-MM-dd_HH-mm')"
New-Item -ItemType Directory -Force $destino | Out-Null
Copy-Item "$bot\dados\listas.json", "$bot\config.json" $destino
```
Cada execução cria uma pasta com data e hora em **Área de Trabalho → backup-bot**. Para guardar fora do PC, use um Google Drive ou OneDrive **privado**.

**Para restaurar:**
1. Pare o bot.
2. Copie o `listas.json` do backup para a pasta `dados` do bot.
3. Copie o `config.json` do backup para a pasta do bot.
4. Inicie o bot de novo.

## Deixar o bot sempre ligado

**Opção simples:** deixe a janela do PowerShell aberta e, em **Configurações → Sistema → Energia**, coloque **Suspender: Nunca**.

**Opção recomendada (pm2)**, que reinicia o bot sozinho se ele cair e sobe junto com o Windows:
```powershell
npm.cmd install -g pm2 pm2-windows-startup
cd "C:\caminho\do\bot"
pm2.cmd start index.js --name bot-qb
pm2.cmd save
pm2-startup.cmd install
```

| Para | Comando |
|---|---|
| Ver o que o bot está fazendo | `pm2.cmd logs bot-qb` |
| Reiniciar | `pm2.cmd restart bot-qb` |
| Parar | `pm2.cmd stop bot-qb` |

**Se o WhatsApp pedir QR de novo:**
1. `pm2.cmd stop bot-qb`.
2. `npm.cmd start` e escaneie o QR.
3. Quando aparecer `ONLINE`, aperte Ctrl+C.
4. `pm2.cmd start bot-qb`.

---

## Problemas comuns

| Problema | Solução |
|---|---|
| "a execução de scripts foi desabilitada neste sistema" | Use `npm.cmd` / `pm2.cmd` |
| `Cannot find module 'whatsapp-web.js'` | Faltou o `npm.cmd install` na pasta do bot |
| O bot não responde em nenhum grupo | Veja se aparece `🧪 MODO TESTE` no início. Se sim, reinicie numa janela nova |
| O bot não responde a `!ygo Nome` | Confira com `!listas` se a lista existe. A inscrição só funciona em grupos |
| "Não há dados da versão antiga" no `!importarlegado` | O `dados_campeonato.json` não está na raiz da pasta do bot |
| Tudo é respondido duas vezes | Dois bots com o mesmo número: pare um deles |
| O QR code aparece toda vez | A pasta `.wwebjs_auth` foi apagada ou o aparelho foi desconectado no celular |
| `🔄 WhatsApp reconectado` no terminal | Normal: o WhatsApp Web reconectou. Se for frequente, verifique a internet e o celular da QB GeeK |
| O bot parou depois de uma atualização do WhatsApp | O WhatsApp muda o site com frequência: é preciso atualizar a biblioteca do bot |

---

## Para desenvolvedores

- **[AGENTS.md](AGENTS.md):** arquitetura, decisões com o cliente, testes e armadilhas conhecidas. Leia antes de alterar o código.
- **[ALTERACOES.md](ALTERACOES.md):** histórico completo das mudanças.
- **Antes de qualquer envio para a `master`:** rode `npm test`.

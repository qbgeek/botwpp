# ⚠️⚠️⚠️ ANTES DE SUBIR NO SERVIDOR ⚠️⚠️⚠️

# 🛑 LEIA ISTO ANTES DE ATUALIZAR O BOT

## 1️⃣ FAÇA BACKUP DE `dados_campeonato.json` E `config.json`

> # 🚨 O arquivo `dados_campeonato.json` FOI REMOVIDO DO GIT 🚨
>
> ### Ele continha nomes reais dos jogadores. Ao trocar de branch, o git pode **APAGAR** esse arquivo no servidor ou **SE RECUSAR** a atualizar.
>
> ### ➡️ Copie `dados_campeonato.json` e `config.json` para **FORA** da pasta do projeto **ANTES** de qualquer `git pull` ou `git checkout`.

Passo a passo:

1. **Pare o bot.**
2. **Copie para fora da pasta do projeto:**
   - `dados_campeonato.json`
   - `config.json`
3. Atualize o código:
   ```bash
   git fetch
   git checkout feat/multi-eventos
   ```
   - Se o git reclamar de alterações locais em `dados_campeonato.json`, mova o arquivo para fora da pasta, rode o `checkout` e traga-o de volta.
   - Se o arquivo **sumir** depois do `checkout`, restaure a cópia do backup.
4. `npm install`
5. `npm start`. A sessão do WhatsApp (`.wwebjs_auth/`) é mantida, então **não é preciso ler o QR code de novo**.

## 2️⃣ IMPORTE A LISTA ANTIGA

> ### No grupo da lista atual, um ADM envia:
>
> # `!importarlegado #liga`
>
> ### Troque `liga` pelo nome que a galera vai usar para se inscrever (`!liga Nome`).

Isso traz os inscritos atuais para o novo formato e mantém o título 🏆 LIGA QB. Quem tinha 🆗 no nome fica marcado como pago. O arquivo antigo é renomeado para `dados_campeonato.importado-<data>.json`, que fica como backup.

Quem foi adicionado por ADM ou está pago **não sai sozinho**: só um ADM remove, com `!remover nº`.

## 3️⃣ ADMs

> ### O NÚMERO DO BOT É SEMPRE ADM.
> ### Use-o para cadastrar os primeiros ADMs: `!addadm @pessoa`

Os ADMs que já estão no `config.json` continuam valendo.

## 4️⃣ TESTE ANTES DE LIBERAR

> ### Esta versão foi testada com mensagens simuladas, **NÃO conectada ao WhatsApp real**.
> ### Faça um teste rápido em um grupo antes de divulgar.

## 5️⃣ AVISE A GALERA QUE OS COMANDOS MUDARAM

> # 🔁 `!participar`, `!lista`, `!ajuda` e `!comandos` DEIXARAM DE EXISTIR
>
> ### Antes de liberar, mande no grupo algo como:
>
> ### *"Agora pra entrar na lista é `!liga Seu Nome`. A lista aparece atualizada sempre que alguém entra ou sai."*

| Antes | Agora |
|-------|-------|
| `!participar Nome` | `!<nome da lista> Nome` (ex.: `!ygo Lucas`) |
| `!lista` | Só ADM: `!lista #ygo` |
| `!ajuda` / `!comandos` | `!neymar` / `!ajudaney` |
| `!limparlista` + `!setdata` + `!sethora` + `!vagas` | `!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00` |

---

# 🤖 Bot QB Geek

Bot de WhatsApp da QB Geek para listas de inscrição: Yu-Gi-Oh!, Pokémon, Magic ou qualquer outro evento. O ADM cria listas com o nome que quiser (`#ygo`, `#cup`, `#glc`…), e cada nome vira o comando de inscrição (`!ygo Nome`). Cada grupo pode ter várias listas ao mesmo tempo.

## Stack

- **Node.js** (CommonJS)
- **[whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)**: controla o WhatsApp Web por um Chrome invisível (Puppeteer)
- **qrcode-terminal**: QR code de login no terminal
- **Arquivos JSON** como banco de dados:
  - `dados/listas.json`: listas de cada grupo
  - `config.json`: ADMs

  Os dois ficam fora do git.

## Rodando

```bash
npm install
npm start
```

Na primeira vez, escaneie o QR code com o WhatsApp do número do bot.

## Uso rápido

| Quem | Comando | O que faz |
|------|---------|-----------|
| ADM | `!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00` | Cria a lista (data, hora, vagas, reservas, valor); se já existir, abre nova edição |
| ADM | `!pago ygo 14` | Coloca o 🆗 no nº 14 |
| ADM | `!vagas ygo 28` | Ajusta as vagas (o nome da lista é opcional se o grupo tiver só uma) |
| Jogador | `!ygo Nome` | Entra na lista e recebe a lista atualizada |
| Jogador | `!sair` | Sai da lista |
| Todos | `!neymar` | Menu de comandos |

A referência completa de comandos e todas as alterações desta versão estão em **[ALTERACOES.md](ALTERACOES.md)**.

## Estrutura

```
index.js            # inicia o WhatsApp e repassa as mensagens
comandos/index.js   # tabela de comandos, checagem de ADM e listas como comandos (!ygo)
comandos/gestao.js  # criar, recomeçar, limpar e excluir listas
comandos/*.js       # um arquivo por assunto (participar, sair, vagas...)
utils/              # dados, jogadores, formatação da lista, efeitos
```

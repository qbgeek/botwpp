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

> ### No grupo do campeonato atual, um ADM envia:
>
> # `!importarlegado pokemon`
>
> ### (ou `!importarlegado` para manter o nome antigo, 🏆 LIGA QB)

Isso traz os inscritos atuais para o novo formato. O arquivo antigo é renomeado para `dados_campeonato.importado-<data>.json`, que fica como backup.

Os inscritos atuais foram adicionados por ADM. Cada um pode enviar **`!eusou [nº]`** para conseguir sair sozinho depois.

## 3️⃣ ADMs

> ### O NÚMERO DO BOT É SEMPRE ADM.
> ### Use-o para cadastrar os primeiros ADMs: `!addadm @pessoa`

Os ADMs que já estão no `config.json` continuam valendo.

## 4️⃣ TESTE ANTES DE LIBERAR

> ### Esta versão foi testada com mensagens simuladas, **NÃO conectada ao WhatsApp real**.
> ### Faça um teste rápido em um grupo antes de divulgar.

---

# 🤖 Bot QB Geek

Bot de WhatsApp da QB Geek para listas de inscrição de eventos: Pokémon, Magic, Yu-Gi-Oh! ou qualquer outro. Cada grupo do WhatsApp pode ter o seu evento, todos rodando ao mesmo tempo.

## Stack

- **Node.js** (CommonJS)
- **[whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)**: controla o WhatsApp Web por um Chrome invisível (Puppeteer)
- **qrcode-terminal**: QR code de login no terminal
- **Arquivos JSON** como banco de dados:
  - `dados/eventos.json`: eventos por grupo
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
| ADM | `!criarevento magic` | Cria o evento no grupo (`pokemon`, `magic`, `yugioh` ou nome livre) |
| ADM | `!vagas 16` / `!espera 4` | Abre as inscrições |
| Jogador | `!participar Nome` | Entra na lista |
| Jogador | `!sair` | Sai da lista |
| Todos | `!ajuda` | Lista todos os comandos |

A referência completa de comandos e todas as alterações desta versão estão em **[ALTERACOES.md](ALTERACOES.md)**.

## Estrutura

```
index.js            # inicia o WhatsApp e repassa as mensagens
comandos/index.js   # tabela de comandos + checagem de ADM/grupo/evento
comandos/*.js       # um arquivo por assunto (participar, sair, vagas...)
utils/              # dados, tipos de evento, listas, formatação, efeitos
```

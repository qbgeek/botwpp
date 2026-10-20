# 🤖 Bot QB Geek

Bot de WhatsApp da QB Geek para listas de inscrição: Yu-Gi-Oh!, Pokémon, Magic ou qualquer outro evento.

- Você cria listas com o nome que quiser (`#ygo`, `#cup`, `#glc`…), e **cada nome vira o comando de inscrição**: a galera entra com `!ygo Nome`.
- Cada grupo pode ter várias listas ao mesmo tempo.
- Sempre que alguém entra ou sai, o bot responde com a lista atualizada.

Este guia tem duas partes. **Faça a Parte 1 antes da Parte 2.**

1. **[Parte 1 — Teste local](#parte-1--teste-local)**: testa tudo com outro número, sem tocar nos grupos reais.
2. **[Parte 2 — Instalação definitiva](#parte-2--instalação-definitiva)**: coloca o bot novo no número da QB GeeK, em todos os grupos.

Depois: [Uso no dia a dia](#uso-no-dia-a-dia) · [Problemas comuns](#problemas-comuns) · [Para desenvolvedores](#para-desenvolvedores)

---

## O que você vai precisar

| Item | Para quê |
|---|---|
| **Computador com Windows** (o mesmo que roda o bot hoje) | Rodar o bot |
| **Node.js LTS**: <https://nodejs.org> → botão "LTS" → instalar com as opções padrão | O programa que executa o bot |
| **Git**: <https://git-scm.com/download/win> → instalar com as opções padrão | Baixar e atualizar o código |
| **Para o teste:** um WhatsApp que **não seja** o da QB GeeK (chip extra ou de alguém da equipe) e **mais uma pessoa** para fazer o papel de jogador | Testar sem mexer nos grupos reais |
| **Para a instalação:** o celular com o WhatsApp da **QB GeeK** | Conectar o bot definitivo |

Para conferir a instalação, abra o **PowerShell** (menu Iniciar → digite "PowerShell") e rode:

```powershell
node -v
git --version
```

Os dois devem mostrar um número de versão.

> 💡 **Use sempre `npm.cmd` (e não `npm`) no PowerShell.** O Windows costuma bloquear o `npm` com o erro "a execução de scripts foi desabilitada neste sistema". O `npm.cmd` funciona igual e não esbarra nesse bloqueio.

---

# Parte 1 — Teste local

> ⚠️ **Nunca use o número da QB GeeK neste teste.** Se ele for conectado em dois computadores ao mesmo tempo, o bot responde em dobro nos grupos.

## 1.1 Baixe o código numa pasta separada

Use uma pasta **só para o teste**, diferente da pasta do bot que está rodando hoje:

```powershell
cd C:\
git clone https://github.com/qbgeek/botwpp.git bot-teste
cd C:\bot-teste
git checkout feat/multi-eventos
```

## 1.2 Instale

```powershell
npm.cmd install
```

Leva alguns minutos, porque baixa também o navegador que o bot usa por baixo.

## 1.3 Rode o teste automático

```powershell
npm.cmd test
```

Deve terminar com **`✅ 38 testes aprovados.`** Esse teste não usa o WhatsApp.

## 1.4 Crie os grupos de teste

No WhatsApp do **número de teste**, crie dois grupos com a pessoa que vai ajudar:

- `Teste Bot QB`
- `Teste Bot QB 2`

**Os nomes precisam ser exatamente esses.**

## 1.5 Inicie o bot em modo teste

```powershell
$env:BOT_SOMENTE_GRUPO="Teste Bot QB,Teste Bot QB 2"; npm.cmd start
```

No início, deve aparecer:

```
🧪 MODO TESTE: só responde nos grupos "teste bot qb", "teste bot qb 2"
```

> 🛑 **Se essa linha não aparecer, aperte Ctrl+C e não continue.** Sem ela, o bot responderia em qualquer conversa do número.

## 1.6 Conecte o número de teste

1. Um **QR code** aparece no PowerShell. Se ficar cortado, aumente a janela.
2. No celular do número de teste: **Configurações → Aparelhos conectados → Conectar um aparelho** → escaneie o QR.
3. Espere aparecer **`🏆 BOT DA QB ONLINE!`**.

## 1.7 Teste os comandos

Em **Teste Bot QB**:
- **Você** é quem está com o número do bot (é ADM automaticamente).
- **Jogador** é a outra pessoa.

As respostas do bot aparecem como mensagens do número de teste.

| # | Quem | Mensagem | Esperado |
|---|---|---|---|
| 1 | Jogador | `!neymar` | Menu curto, só de jogador |
| 2 | Você | `!neymar` | Menu completo, com comandos de ADM |
| 3 | Jogador | `!lista` | Só uma reação 🔒, sem mensagem |
| 4 | Jogador | `!vagas 10` | "🔒 Acesso negado" |
| 5 | Você | `!lista #ygo 30/10/2026 18h30 2 1 R$ 20,00` | "🆕 Lista criada!" + lista vazia |
| 6 | Jogador | `!ygo Fulano` | "✅ *Fulano* inscrito! 📋 Resta 1 vaga" + lista |
| 7 | Você | `!ygo Seu Nome` | "🔒 Essa foi a última vaga" |
| 8 | Você | `!add ygo Convidado` | Vai para a fila de espera |
| 9 | Você | `!pago ygo 1` | Aparece 🆗 ao lado do nome 1 |
| 10 | Jogador | `!sair` | Não sai: "vaga confirmada pela organização" |
| 11 | Você | `!naopago ygo 1` e depois Jogador `!sair` | Sai, e o Convidado sobe da fila |
| 12 | Você | `!vagas ygo 5` | Resposta de uma linha |
| 13 | Você | `!lista #ygo 07/11/2026 18h30 5 2` e depois `!confirmar` | Nova edição com a lista zerada |
| 14 | Você | `!todos Teste de aviso` | Todos recebem notificação |
| 15 | Jogador | `!ygo Teste` **no grupo Teste Bot QB 2** | Nenhuma resposta (a lista é do outro grupo) |

A lista completa de comandos está em [Uso no dia a dia](#uso-no-dia-a-dia) e em [ALTERACOES.md](ALTERACOES.md).

## 1.8 Encerre o teste e apague tudo

1. No PowerShell, aperte **Ctrl+C** para parar o bot.
2. No celular do número de teste: **Configurações → Aparelhos conectados** → toque no aparelho do bot → **Desconectar**.
3. Feche o PowerShell e apague a pasta do teste:
   ```powershell
   Remove-Item -Recurse -Force C:\bot-teste
   ```

Pronto: nada do teste fica no computador.

---

# Parte 2 — Instalação definitiva

# ⚠️ ANTES DE COMEÇAR

> ### 1. Faça a instalação num horário sem inscrições acontecendo. O bot fica fora do ar por alguns minutos.
> ### 2. **FAÇA BACKUP** dos arquivos `dados_campeonato.json` e `config.json`. O `dados_campeonato.json` foi **removido do git** (tinha nomes de jogadores), e o git pode **apagá-lo** ou **se recusar a atualizar**.

Nos passos abaixo, `C:\caminho\do\bot` é a pasta onde o bot roda hoje. Troque pelo caminho real.

## 2.1 Pare o bot atual

Na janela onde o bot está rodando, aperte **Ctrl+C**. Se ele roda pelo pm2, use `pm2.cmd stop all`.

## 2.2 Faça o backup

```powershell
cd C:\caminho\do\bot
New-Item -ItemType Directory -Force C:\backup-bot
Copy-Item dados_campeonato.json, config.json C:\backup-bot\
```

Confira que os dois arquivos estão em `C:\backup-bot`.

## 2.3 Atualize o código

```powershell
git fetch
git checkout feat/multi-eventos
```

- Se o git reclamar de alterações em `dados_campeonato.json`:
  1. mova o arquivo para fora da pasta;
  2. rode o `checkout` de novo;
  3. traga o arquivo de volta.
- **Se o `dados_campeonato.json` sumir**, restaure do backup:
  ```powershell
  Copy-Item C:\backup-bot\dados_campeonato.json .
  ```

## 2.4 Instale

```powershell
npm.cmd install
npm.cmd test
```

O teste deve terminar com `✅ 38 testes aprovados.`

## 2.5 Inicie o bot de verdade

**Abra uma janela nova do PowerShell.** Assim nenhuma configuração do modo teste fica para trás. Depois:

```powershell
cd C:\caminho\do\bot
npm.cmd start
```

> 🛑 **Confira que NÃO aparece a linha `🧪 MODO TESTE`.** Se aparecer, o bot só responderia nos grupos de teste: feche a janela e abra outra.

- **Se aparecer um QR code**, escaneie com o celular da **QB GeeK** (**Aparelhos conectados → Conectar um aparelho**).
- **Se não aparecer**, a sessão antiga foi aproveitada.

Espere **`🏆 BOT DA QB ONLINE!`**.

## 2.6 Importe a lista que já existe

No grupo onde a lista atual roda, mande **pelo número da QB GeeK**:

```
!importarlegado #liga
```

- Troque `liga` pelo nome que a galera vai usar para se inscrever. Com `#liga`, o comando de inscrição é `!liga Nome`.
- O título "LIGA QB" e os inscritos são mantidos.
- Quem tinha 🆗 no nome fica marcado como pago.

## 2.7 Crie as listas de cada grupo

Em cada grupo, mande o comando da lista: nome, data, hora, vagas, reservas e valor.

```
!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00
!lista #cup 01/11/2026 13h30 32 8 R$ 35,00 MASTERS, R$ 25,00 SEN/JR
!lista #glc 02/11/2026 14h 16 4 R$ 15,00
```

- **Ordem:** data, hora (**sem espaço**: `10h00AM`), vagas, reservas e, por último, o valor, que pode ter espaços e vírgulas.
- Um grupo pode ter várias listas (ex.: `#cup` e `#challenge` no grupo de Pokémon).
- Para mudar o título que aparece no topo: `!settitulo ygo LIGA YU-GI-OH QB`.

## 2.8 Cadastre os ADMs

O número da QB GeeK é sempre ADM. Para cada pessoa da equipe, mande num grupo onde ela esteja:

```
!addadm @pessoa
```

Os ADMs que já existiam no `config.json` continuam valendo. Para conferir a lista, use `!admins`.

## 2.9 Avise a galera

> # 🔁 `!participar`, `!lista`, `!ajuda` e `!comandos` DEIXARAM DE EXISTIR

Sugestão de mensagem para cada grupo:

> 📢 *O bot da QB mudou!*
> Para entrar na lista agora é *!ygo Seu Nome* (o comando de cada lista aparece no fim dela).
> A lista atualizada aparece sempre que alguém entra ou sai, então não precisa mais pedir !lista.
> Para sair: *!sair* · Menu: *!neymar*

| Antes | Agora |
|---|---|
| `!participar Nome` | `!<nome da lista> Nome` (ex.: `!ygo Lucas`) |
| `!lista` | Só ADM: `!lista #ygo` |
| `!ajuda` / `!comandos` | `!neymar` / `!ajudaney` |
| `!limparlista` + `!setdata` + `!sethora` + `!vagas` | `!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00` + `!confirmar` |

## 2.10 Deixe o bot funcionando sempre

**Opção simples:** deixe a janela do PowerShell aberta e impeça o computador de dormir em **Configurações → Sistema → Energia → Suspender: Nunca**.

**Opção recomendada (pm2)**, que reinicia o bot sozinho se ele cair e sobe junto com o Windows:

```powershell
npm.cmd install -g pm2 pm2-windows-startup
cd C:\caminho\do\bot
pm2.cmd start index.js --name bot-qb
pm2.cmd save
pm2-startup.cmd install
```

| Para | Comando |
|---|---|
| Ver o que o bot está fazendo | `pm2.cmd logs bot-qb` |
| Reiniciar o bot | `pm2.cmd restart bot-qb` |
| Parar o bot | `pm2.cmd stop bot-qb` |

> Se um dia o WhatsApp pedir QR de novo: rode `pm2.cmd stop bot-qb`, depois `npm.cmd start`, escaneie o QR e, quando aparecer ONLINE, aperte Ctrl+C e rode `pm2.cmd start bot-qb`.

---

## Uso no dia a dia

### Rotina semanal (ADM)

| Quero… | Comando |
|---|---|
| Abrir a lista da semana (zera a anterior) | `!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00` → `!confirmar` |
| Aumentar as vagas (a fila de espera sobe sozinha) | `!vagas ygo 28` |
| Marcar quem pagou (🆗) / desmarcar | `!pago ygo 14` / `!naopago ygo 14` |
| Colocar alguém na lista | `!add ygo Nome` ou `!add ygo @pessoa` |
| Tirar alguém | `!remover ygo 3` (fila de espera: `!remover ygo e1`) |
| Corrigir um nome | `!alterar ygo 3 Nome Certo` |
| Ver a lista | `!lista #ygo` |
| Ver todas as listas | `!listas` |
| Avisar todo mundo | `!todos Começa às 18h30!` |
| Mudar data, hora ou valor | `!setdata ygo 31/10/2026` · `!sethora ygo 19h` · `!setvalor ygo 25,00` |
| Meta de premiação | `!meta ygo 20` · `!premio1 ygo Booster Box` |
| Apagar uma lista de vez | `!excluirlista ygo` → `!confirmar` |
| Ver todos os comandos | `!neymar` |

> Se o grupo tiver **uma lista só**, o nome dela é opcional: `!vagas 28`, `!pago 14`.

### Jogadores

| Comando | O que faz |
|---|---|
| `!ygo Seu Nome` | Entra na lista (troque `ygo` pelo nome da lista) |
| `!sair` | Sai da lista. Quem está pago ou foi adicionado por ADM precisa pedir a um ADM |
| `!meta ygo` | Mostra o desafio da premiação |
| `!neymar` | Menu |

---

## Problemas comuns

| Problema | Solução |
|---|---|
| "a execução de scripts foi desabilitada neste sistema" | Use `npm.cmd` em vez de `npm` (e `pm2.cmd` em vez de `pm2`) |
| O bot não responde em nenhum grupo | Veja se apareceu `🧪 MODO TESTE` no início. Se sim, feche a janela e abra outra sem o modo teste |
| O bot não responde a `!ygo Nome` | A lista existe neste grupo? Confira com `!listas`. As listas só funcionam no grupo onde foram criadas |
| "🤔 Qual lista?" | O grupo tem mais de uma lista: coloque o nome depois do comando (`!vagas ygo 28`) |
| "Não entendi os dados" ao criar a lista | A hora não pode ter espaço (`10h00AM`). A ordem é data, hora, vagas, reservas, valor |
| O QR code aparece toda vez | A pasta `.wwebjs_auth` foi apagada ou o aparelho foi desconectado no celular. Escaneie de novo |
| O bot parou de funcionar depois de uma atualização do WhatsApp | O WhatsApp muda o site com frequência. Avise o desenvolvedor para atualizar a biblioteca do bot |

---

## Para desenvolvedores

- **[AGENTS.md](AGENTS.md):** contexto completo do projeto (arquitetura, decisões, testes, problemas conhecidos). Leia antes de alterar.
- **[ALTERACOES.md](ALTERACOES.md):** tudo o que mudou nesta versão e a referência completa de comandos.
- **Testes:** `npm test` (sem WhatsApp).
- **Stack:** Node.js + [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) (WhatsApp Web via Chrome headless). Dados em `dados/listas.json` e `config.json`, ambos fora do git.

```
index.js            # inicia o WhatsApp e repassa as mensagens
comandos/index.js   # tabela de comandos, checagem de ADM, listas como comandos (!ygo)
comandos/*.js       # um arquivo por assunto
utils/              # dados, jogadores, formatação, leitura do WhatsApp, modo teste
teste/simular.js    # testes automáticos (npm test)
```

# 🤖 Bot QB Geek

Bot de WhatsApp da QB Geek para listas de inscrição: Yu-Gi-Oh!, Pokémon, Magic ou qualquer outro evento.

- Você cria listas com o nome que quiser (`#ygo`, `#cup`, `#glc`…), e **cada nome vira o comando de inscrição**: a galera entra com `!ygo Nome`.
- As listas valem em **todos os grupos** em que o bot está, inclusive grupos criados depois. Basta adicionar o número da QB GeeK ao grupo novo.
- Sempre que alguém entra ou sai, o bot responde com a lista atualizada.

Este guia tem duas partes. **Faça a Parte 1 antes da Parte 2.**

1. **[Parte 1 — Teste local](#parte-1--teste-local)**: testa tudo com outro número, sem tocar nos grupos reais.
2. **[Parte 2 — Instalação definitiva](#parte-2--instalação-definitiva)**: coloca o bot novo no número da QB GeeK, mantendo o antigo guardado para voltar se precisar.

Depois: [Uso no dia a dia](#uso-no-dia-a-dia) · [Problemas comuns](#problemas-comuns) · [Para desenvolvedores](#para-desenvolvedores)

> A versão antiga do bot está guardada na branch `projeto-legado` do GitHub.

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

> ⚠️ **Nunca use o número da QB GeeK neste teste.** Se ele for conectado em dois lugares ao mesmo tempo, o bot responde em dobro nos grupos.

## 1.1 Baixe o código numa pasta só para o teste

```powershell
git clone https://github.com/qbgeek/botwpp.git C:\bot-teste
cd C:\bot-teste
```

Para abrir no VS Code: `code .`

## 1.2 Instale

```powershell
npm.cmd install
```

Leva alguns minutos, porque baixa também o navegador que o bot usa por baixo.

## 1.3 Rode o teste automático

```powershell
npm.cmd test
```

Deve terminar com **`✅ 46 testes aprovados.`** Esse teste não usa o WhatsApp.

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

1. Um **QR code** aparece no terminal. Se ficar cortado, aumente a janela.
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
| 15 | Jogador | `!ygo Teste` **no grupo Teste Bot QB 2** | Inscrito: a lista vale em todos os grupos |

A lista completa de comandos está em [Uso no dia a dia](#uso-no-dia-a-dia) e em [ALTERACOES.md](ALTERACOES.md).

## 1.8 Encerre o teste e apague tudo

1. No terminal, aperte **Ctrl+C** para parar o bot.
2. No celular do número de teste: **Configurações → Aparelhos conectados** → toque no aparelho do bot → **Desconectar**.
3. Feche o terminal e apague a pasta do teste:
   ```powershell
   Remove-Item -Recurse -Force C:\bot-teste
   ```

Pronto: nada do teste fica no computador.

---

# Parte 2 — Instalação definitiva

O bot novo vai numa **pasta nova**. A pasta do bot antigo **não é alterada**: ela fica guardada para voltar atrás, se precisar.

> ⚠️ **Faça num horário sem inscrições acontecendo.** O bot fica fora do ar por alguns minutos.
>
> 🛑 **Os dois bots nunca podem rodar ao mesmo tempo** com o número da QB GeeK, senão tudo é respondido em dobro.
>
> 🛑 **Não rode `git pull` na pasta do bot antigo.** Isso trocaria o código dele pelo novo.

Nos passos abaixo, `C:\caminho\do\bot-antigo` é a pasta onde o bot roda hoje. Troque pelo caminho real.

## 2.1 Baixe o bot novo numa pasta nova

```powershell
git clone https://github.com/qbgeek/botwpp.git C:\bot-qb
cd C:\bot-qb
npm.cmd install
npm.cmd test
```

O teste deve terminar com `✅ 46 testes aprovados.`

## 2.2 Copie os 2 arquivos da pasta antiga

| Arquivo | O que tem | Obrigatório? |
|---|---|---|
| `dados_campeonato.json` | A lista de inscrição atual | Sim, para importar a lista |
| `config.json` | Os ADMs cadastrados | Sim, para manter os ADMs |

```powershell
Copy-Item C:\caminho\do\bot-antigo\dados_campeonato.json C:\bot-qb\
Copy-Item C:\caminho\do\bot-antigo\config.json C:\bot-qb\
```

São **cópias**: os originais continuam intactos na pasta antiga. **Não copie a pasta `.wwebjs_auth`**: o bot novo vai pedir um QR code próprio.

## 2.3 Pare o bot antigo

Na janela onde ele está rodando, aperte **Ctrl+C**. Se ele roda pelo pm2, use `pm2.cmd stop all`.

## 2.4 Inicie o bot novo

**Abra uma janela nova do PowerShell.** Assim nenhuma configuração do modo teste fica para trás. Depois:

```powershell
cd C:\bot-qb
npm.cmd start
```

> 🛑 **Confira que NÃO aparece a linha `🧪 MODO TESTE`.** Se aparecer, feche a janela e abra outra.

1. Escaneie o QR code com o celular da **QB GeeK** (**Aparelhos conectados → Conectar um aparelho**).
2. Espere **`🏆 BOT DA QB ONLINE!`**.

## 2.5 Importe a lista atual

Em qualquer grupo, mande **pelo número da QB GeeK**:

```
!importarlegado #liga
```

- Troque `liga` pelo nome que a galera vai usar para se inscrever. Com `#liga`, o comando de inscrição é `!liga Nome`.
- O título "LIGA QB" e os inscritos são mantidos.
- Quem tinha 🆗 no nome fica marcado como pago.

## 2.6 Crie as outras listas

Mande o comando de cada lista: nome, data, hora, vagas, reservas e valor. Pode ser **em qualquer grupo ou no privado do bot**, porque a lista vale para todos os grupos.

```
!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00
!lista #cup 01/11/2026 13h30 32 8 R$ 35,00 MASTERS, R$ 25,00 SEN/JR
!lista #glc 02/11/2026 14h 16 4 R$ 15,00
```

- **Ordem:** data, hora (**sem espaço**: `10h00AM`), vagas, reservas e, por último, o valor, que pode ter espaços e vírgulas.
- Para mudar o título que aparece no topo: `!settitulo ygo LIGA YU-GI-OH QB`.
- **Grupo novo no futuro?** Basta adicionar o número da QB GeeK. Todas as listas já funcionam nele.

## 2.7 Cadastre os ADMs

Os ADMs do `config.json` copiado continuam valendo (confira com `!admins`). Para cadastrar mais alguém, mande num grupo onde a pessoa esteja:

```
!addadm @pessoa
```

## 2.8 Avise a galera

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

## 2.9 Deixe o bot funcionando sempre

**Opção simples:** deixe a janela do PowerShell aberta e impeça o computador de dormir em **Configurações → Sistema → Energia → Suspender: Nunca**.

**Opção recomendada (pm2)**, que reinicia o bot sozinho se ele cair e sobe junto com o Windows:

```powershell
npm.cmd install -g pm2 pm2-windows-startup
cd C:\bot-qb
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

## 2.10 Se precisar voltar para o bot antigo

1. Pare o bot novo (Ctrl+C ou `pm2.cmd stop bot-qb`).
2. Na pasta antiga, rode `npm.cmd start`.

A lista dele é a de **antes da migração**: inscrições feitas no bot novo não voltam.

Depois de alguns dias com o bot novo funcionando bem, remova a conexão antiga no celular (**Aparelhos conectados**) e, se quiser, apague a pasta antiga.

---

## Uso no dia a dia

### Rotina semanal (ADM)

Os comandos de ADM funcionam **nos grupos ou no privado do bot**. No privado, a galera não vê o vai e vem.

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
| Avisar todo mundo do grupo | `!todos Começa às 18h30!` |
| Mudar data, hora ou valor | `!setdata ygo 31/10/2026` · `!sethora ygo 19h` · `!setvalor ygo 25,00` |
| Meta de premiação | `!meta ygo 20` · `!premio1 ygo Booster Box` |
| Apagar uma lista de vez | `!excluirlista ygo` → `!confirmar` |
| Ver todos os comandos | `!neymar` |

> **Quando o nome da lista é opcional:** se só existir uma lista, ou se só uma lista foi criada no grupo onde você está, `!vagas 28` e `!pago 14` funcionam direto.

### Jogadores

| Comando | O que faz |
|---|---|
| `!ygo Seu Nome` | Entra na lista, em qualquer grupo (troque `ygo` pelo nome da lista) |
| `!sair` | Sai da lista. Quem está pago ou foi adicionado por ADM precisa pedir a um ADM |
| `!meta ygo` | Mostra o desafio da premiação |
| `!neymar` | Menu |

---

## Problemas comuns

| Problema | Solução |
|---|---|
| "a execução de scripts foi desabilitada neste sistema" | Use `npm.cmd` em vez de `npm` (e `pm2.cmd` em vez de `pm2`) |
| O bot não responde em nenhum grupo | Veja se apareceu `🧪 MODO TESTE` no início. Se sim, feche a janela e abra outra sem o modo teste |
| O bot não responde a `!ygo Nome` | A lista existe? Confira com `!listas`. A inscrição só funciona em grupos, não no privado |
| "🤔 Qual lista?" | Existe mais de uma lista: coloque o nome depois do comando (`!vagas ygo 28`) |
| "Não entendi os dados" ao criar a lista | A hora não pode ter espaço (`10h00AM`). A ordem é data, hora, vagas, reservas, valor |
| O QR code aparece toda vez | A pasta `.wwebjs_auth` foi apagada ou o aparelho foi desconectado no celular. Escaneie de novo |
| Tudo é respondido duas vezes | Dois bots estão rodando com o mesmo número. Pare o antigo |
| O bot parou de funcionar depois de uma atualização do WhatsApp | O WhatsApp muda o site com frequência. Avise o desenvolvedor para atualizar a biblioteca do bot |

---

## Para desenvolvedores

- **[AGENTS.md](AGENTS.md):** contexto completo do projeto (arquitetura, decisões, testes, problemas conhecidos). Leia antes de alterar.
- **[ALTERACOES.md](ALTERACOES.md):** tudo o que mudou nesta versão e a referência completa de comandos.
- **Testes:** `npm test` (sem WhatsApp).
- **Branches:** `master` tem a versão atual; `projeto-legado` guarda a versão antiga.
- **Stack:** Node.js + [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) (WhatsApp Web via Chrome headless). Dados em `dados/listas.json` e `config.json`, ambos fora do git.

```
index.js            # inicia o WhatsApp e repassa as mensagens
comandos/index.js   # tabela de comandos, checagem de ADM, listas como comandos (!ygo)
comandos/*.js       # um arquivo por assunto
utils/              # dados, jogadores, formatação, leitura do WhatsApp, modo teste
teste/simular.js    # testes automáticos (npm test)
```

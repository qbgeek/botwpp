# 🤖 Bot QB Geek — Comandos

Bot de WhatsApp da QB Geek para listas de inscrição: Yu-Gi-Oh!, Pokémon, Magic ou qualquer outro evento.

> Instalação, testes, atualização e backup: **[STACK.md](STACK.md)**.

## Como funciona

- O ADM cria listas com o nome que quiser (`#ygo`, `#cup`, `#glc`…), e **cada nome vira o comando de inscrição**: a galera entra com `!ygo Nome`.
- As listas valem em **todos os grupos** em que o bot está, inclusive grupos criados depois.
- **Sempre que alguém entra ou sai, o bot responde com a lista atualizada**, mostrando só até o último nome.
- Os ajustes de configuração respondem com uma linha só, para não encher o grupo.
- O menu de comandos é o **`!neymar`**. O jogador vê só a parte dele; o ADM vê tudo.

---

## Jogadores

| Comando | O que faz |
|---|---|
| `!ygo Seu Nome` | Entra na lista `ygo` (troque `ygo` pelo nome da lista). O comando de cada lista aparece no fim dela |
| `!sair` | Sai da lista. Se a pessoa estiver em mais de uma, use `!sair ygo` |
| `!meta ygo` | Mostra o desafio da premiação da lista |
| `!neymar` ou `!ajudaney` | Mostra o menu de comandos |

- Se a lista estiver cheia, a pessoa entra na **fila de espera** e sobe sozinha quando abrir vaga.
- Quem está **pago (🆗)** ou foi **adicionado por um ADM** não sai sozinho: precisa pedir a um ADM.
- A inscrição só funciona **dentro de grupos**, não no privado do bot.

---

## ADM

Os comandos de ADM funcionam **nos grupos ou no privado do bot**. No privado, a galera não vê o vai e vem. O número da QB GeeK é sempre ADM.

### Criar e gerenciar listas

| Comando | O que faz |
|---|---|
| `!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00` | Cria a lista `ygo`: data, hora, vagas, reservas e valor. **Se a lista já existir, abre uma nova edição** (zera os inscritos depois do `!confirmar`) |
| `!lista #ygo` | Mostra a lista (se não existir, cria uma vazia) |
| `!lista` | Mostra a lista, ou o resumo se houver várias |
| `!listas` | Mostra todas as listas abertas |
| `!limparlista ygo` | Zera inscritos, data, hora, meta e prêmios. Mantém valor, vagas e reservas |
| `!excluirlista ygo` | Apaga a lista de vez (o comando `!ygo` para de funcionar) |
| `!confirmar` | Confirma limpar, recomeçar ou excluir (vale por 2 minutos) |
| `!importarlegado #liga` | Traz a lista da versão antiga do bot como a lista `liga` |

**Regras para criar uma lista:**
- **Ordem:** data, hora, vagas, reservas, valor.
- **A hora não pode ter espaço:** `10h00AM`, não `10h00 AM`.
- **O valor vem por último** e pode ter espaços e vírgulas: `R$ 35,00 MASTERS, R$ 25,00 SEN/JR`.
- **O nome da lista** começa com letra, sem espaços, e não pode ser um comando do bot (como `#sair`). Maiúsculas e acentos não importam: `!MESÃO` é o mesmo que `!mesao`.

### Ajustar uma lista

| Comando | O que faz |
|---|---|
| `!setdata ygo 31/10/2026` | Data |
| `!sethora ygo 19h` | Horário |
| `!setvalor ygo 25,00` | Valor de entrada (com ou sem "R$") |
| `!settitulo ygo LIGA YU-GI-OH QB` | Título no topo da lista |
| `!setlocal ygo R. da Hora, 345` | Local |
| `!setbase ygo Créditos em loja.` | Premiação base |
| `!vagas ygo 28` | Quantidade de vagas. Ao aumentar, **a fila de espera sobe sozinha** |
| `!espera ygo 10` | Quantidade de reservas (fila de espera) |
| `!meta ygo 20` | Meta de jogadores para a premiação especial (`0` desativa) |
| `!premio1 ygo Booster Box` | Prêmio do 1º lugar (também `!premio2` e `!premio3`) |
| `!limparpremios ygo` | Apaga os prêmios |

> **O nome da lista é opcional** se só existir uma lista, ou se só uma lista foi criada no grupo onde você está: `!vagas 28` funciona direto. Fora disso, o bot pergunta "Qual lista?".

### Jogadores na lista

| Comando | O que faz |
|---|---|
| `!add ygo Nome` | Coloca alguém na lista |
| `!add ygo @pessoa` | Coloca alguém marcando a pessoa (usa o nome do perfil) |
| `!pago ygo 14` | Marca o nº 14 como pago (🆗) |
| `!naopago ygo 14` | Desmarca o pago |
| `!alterar ygo 3 Nome Certo` | Corrige o nome do nº 3 |
| `!remover ygo 3` | Tira o nº 3 da lista (o primeiro da espera sobe) |
| `!vincular ygo 3 @pessoa` | Liga a vaga nº 3 ao WhatsApp da pessoa |

> **Fila de espera:** use `e1`, `e2`… no lugar do número. Exemplo: `!remover ygo e1`.

### Avisos e permissões

| Comando | O que faz |
|---|---|
| `!todos Começa às 18h30!` | Marca todos do grupo com `@all` (só em grupos) |
| `!addadm @pessoa` | Torna a pessoa ADM (também aceita o número de telefone) |
| `!deladm @pessoa` | Tira o ADM |
| `!admins` | Lista os ADMs |
| `!id` | Mostra o seu ID do WhatsApp (ou `!id @pessoa`) |

---

## Rotina semanal (exemplo)

1. **Abrir a semana:** `!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00` e depois `!confirmar`.
2. **Avisar:** `!todos Lista do YGO aberta! Entre com !ygo Seu Nome`.
3. **Durante a semana:**
   - quem pagou: `!pago ygo 5`;
   - mais vagas: `!vagas ygo 28`;
   - alguém pediu para sair: `!remover ygo 7`.
4. **Conferir:** `!lista #ygo`.

---

## Comandos que mudaram

| Antes | Agora |
|---|---|
| `!participar Nome` | `!<nome da lista> Nome` (ex.: `!ygo Lucas`) |
| `!lista` (qualquer pessoa) | Só ADM: `!lista #ygo`. Para jogadores, o bot só reage com 🔒 |
| `!ajuda` / `!comandos` | `!neymar` / `!ajudaney` |
| `!limparlista` + `!setdata` + `!sethora` + `!vagas` | `!lista #ygo 30/10/2026 18h30 24 12 R$ 20,00` + `!confirmar` |
| `!confirmarlimpeza` | `!confirmar` (o antigo ainda funciona) |

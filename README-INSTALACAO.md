# Fase 9.3 — Módulo implantável Owner/VIP

Este pacote **não é cumulativo**. Ele foi preparado para ser implantado sobre o **BoTNT Node.js Fase 9.2**.

## O que adiciona

- `/owner` — painel exclusivo do dono do bot.
- Forças exclusivas totalmente fictícias: estratégica, terrestre, naval, aérea e defensiva.
- Multiplicador de guerra do dono configurado em `100x`.
- Sistema **Pro Player** presenteável pelo dono, permanente ou por quantidade de dias.
- Lista, concessão e remoção de Pro Player pelo painel.
- Criação de forças exclusivas pelo painel.
- Registro do multiplicador usado em cada batalha (`attacker_multiplier` e `defender_multiplier`).

> Todo o conteúdo militar deste módulo é abstrato e fictício. Não há materiais, quantidades, procedimentos de construção ou instruções operacionais reais.

## Instalação automática

1. Extraia este ZIP em qualquer pasta.
2. No terminal, dentro da pasta extraída, execute:

```bash
node install-owner-module.mjs /caminho/para/BoTNT-NodeJS-Fase9.2
```

Exemplo em um workspace Linux/Codespaces:

```bash
node install-owner-module.mjs /workspaces/BoTNT-NodeJS-Fase9.2
```

O instalador cria backup automático de:

```text
src/events/interactionCreate.js
src/warfare/BattleResolver.js
```

em:

```text
backups/fase9.3-owner-<data-hora>/
```

## Configuração obrigatória

Adicione ao `.env` do projeto principal:

```env
BOT_OWNER_ID=SEU_ID_DO_DISCORD
```

Use o seu ID numérico do Discord, sem `<@ >`.

Depois reinicie o bot. Como a Fase 9.2 registra os comandos globais automaticamente na inicialização, `/owner` será incluído junto dos demais comandos.

## Painel `/owner`

```text
👑 PAINEL EXCLUSIVO DO DONO

[🛡️ Minhas forças]
[⭐ Pro Players]
[🎁 Presentear Pro]
[🗑️ Remover Pro]
[🔄 Atualizar]

[ Criar força exclusiva ▼ ]
```

Somente o usuário cujo ID é igual a `BOT_OWNER_ID` consegue executar as ações do painel.

## Forças exclusivas incluídas

```text
☢️ Nexus Zero       — sistema estratégico fictício
🛡️ Titan Omega      — blindado fictício
🌊 Abyss Prime       — submersível fictício
✈️ Solaris Wing     — aeronave fictícia
🛰️ Aegis Crown      — defesa estratégica fictícia
```

Os números são apenas atributos de videogame.

## Multiplicador 100x

O arquivo:

```text
data/owner/owner_config.json
```

possui:

```json
{
  "ownerWarMultiplier": 100,
  "proWarMultiplier": 1,
  "exclusiveForcesEnabled": true,
  "proPlayerEnabled": true
}
```

Quando o país participante da batalha possui como líder o `BOT_OWNER_ID`, o `BattleResolver` aplica o multiplicador configurado ao poder daquele lado da batalha.

O **Pro Player não recebe 100x por padrão**. O campo `proWarMultiplier` permanece em `1` para separar o benefício Pro das forças exclusivas do dono.

## Pro Player

No painel, **Presentear Pro** pede:

- ID do jogador;
- quantidade de dias, ou vazio para permanente.

Os registros ficam em:

```text
data/owner/pro_players.json
```

## Arquivos implantados

```text
src/commands/owner.js
src/owner/OwnerAccess.js
src/owner/VipManager.js
src/owner/ExclusiveForcesManager.js
src/owner/OwnerCombatManager.js
src/ui/OwnerPanel.js
src/ui/OwnerUiRouter.js
src/events/interactionCreate.js          <- patch com backup
src/warfare/BattleResolver.js            <- patch com backup
data/owner/owner_config.json
data/owner/pro_players.json
data/owner/exclusive_forces.json
data/owner/exclusive_force_catalog.json
```

## Observação sobre os comandos

A Fase 9.2 possuía 14 comandos principais. Este módulo adiciona somente **um** novo comando público:

```text
/owner
```

Portanto, após a implantação ficam 15 comandos principais, sem restaurar os dezenas de comandos antigos.

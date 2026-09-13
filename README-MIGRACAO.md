# BoTNT — Fase 9: Guerra Mundial

Build cumulativa em Node.js/JavaScript. Inclui as Fases 1–8 e adiciona a integração global da Fase 9.

## Fase 9

- Guerras mundiais entre blocos formados por países e alianças.
- Adesão de países aos blocos A/B com validação de alianças.
- Vínculo com os conflitos territoriais da Fase 7.
- Placar mundial agregado a partir das batalhas dos conflitos vinculados.
- Economia mundial agregada: estabilidade, volume de mercado, efeitos de guerra e eventos.
- Eventos mundiais abstratos de produção, logística e volatilidade.
- Ranking mundial de países usando controle territorial, infraestrutura, vitórias, tratados e estabilidade.
- Snapshots mundiais e auditoria de integridade.
- Nova página `🌐 Guerra Mundial` no `/game`.

## Estrutura nova

```text
src/global_war/
├── GlobalEventManager.js
├── WorldEconomyIndex.js
├── WorldRankingService.js
├── WorldWarManager.js
└── WorldWarHubService.js

data/global_war/
├── world_config.json
├── world_events.json
├── world_rankings.json
├── world_snapshots.json
└── world_wars.json
```

## Comandos principais

- `/guerramundial`
- `/iniciarguerramundial`
- `/aderirguerramundial`
- `/encerrarguerramundial`
- `/economiamundial`
- `/rankingmundial`
- `/eventomundial listar`
- `/eventomundial gerar`
- `/auditarguerramundial`

## Validação

```bash
npm install
npm run check
npm run validate:data
npm run validate:world
npm run validate:military
npm run validate:military-industry
npm run validate:warfare
npm run validate:diplomacy
npm run validate:global-war
npm test
```

No ambiente de build, as validações estáticas e de dados passaram. O teste de integração que importa dependências NPM não foi executado com sucesso porque `node_modules` não está instalado no ambiente de build (`dotenv` ausente). Após `npm install`, rode `npm test`.

Todos os sistemas militares, tecnologias, conflitos e eventos permanecem fictícios e abstratos de jogo.

## Fase 9.1 — Canais, notificações e trocas P2P

Esta atualização cumulativa acrescenta canais configuráveis por servidor e publicações automáticas para mercado, trocas, guerra e eventos mundiais.

### Canais públicos
Use `/configurarcanais` com os subcomandos `definir`, `listar`, `remover` e `testar`.
Tipos disponíveis: `market`, `trades`, `war` e `world`.

### Trocas diretas
Use `/trocar propor` para oferecer item/dinheiro e solicitar item/dinheiro de outro jogador. O que o proponente oferece é reservado imediatamente. O destinatário pode `/trocar aceitar` ou `/trocar recusar`, e o proponente pode `/trocar cancelar`.

As trocas diretas de itens usam o inventário pessoal nesta fase. O mercado tradicional e o mercado internacional continuam usando seus próprios estoques, logística e escrows.

### Notificações integradas
- Ordens locais e internacionais de compra/venda → canal `market`.
- Propostas e conclusões de troca → canal `trades`.
- Batalhas territoriais → canal `war`.
- Eventos mundiais gerados → canal `world`.

Também foi ajustado o loader de comandos para aceitar tanto módulos `export default` quanto o formato legado com `export const data` + `export async function execute`.

---

# Fase 9.2 — Interface Unificada

A lista pública de slash commands foi reduzida para **14 comandos principais**. Os comandos antigos foram preservados em `src/legacy_commands/` e são acionados internamente pelos painéis, portanto a lógica das fases anteriores não foi descartada.

Comandos públicos:

- `/game`
- `/economia`
- `/inventario`
- `/producao`
- `/profissoes`
- `/mercado`
- `/trocas`
- `/industria`
- `/pais`
- `/forcas`
- `/guerra`
- `/diplomacia`
- `/mundial`
- `/configurar`

`/economia` abre um subpainel com **Saldo, Depositar, Sacar, Transferir e Transações**. Os demais sistemas usam painéis, botões e menus de ações. `/game` continua sendo a central geral.

A camada `LegacyActionBridge` reaproveita os handlers das fases anteriores a partir dos menus, evitando dezenas de slash commands públicos.

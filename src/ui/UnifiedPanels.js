import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType
} from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { EconomyService } from '../economy/EconomyService.js';
import { renderPage } from './MainPanel.js';
import { GameChannelManager } from '../notifications/GameChannelManager.js';

const economy = new EconomyService();
const channels = new GameChannelManager();
const money = value => Number(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PANEL_ACTIONS = {
  inventario: [
    ['inventario', '🎒 Inventário'], ['armazenamento', '📦 Armazenamentos']
  ],
  producao: [
    ['recursos', '🧱 Recursos'], ['produtos', '📦 Produtos'], ['receitas', '📜 Receitas'], ['receita', '🔎 Ver receita'], ['produzir', '⚙️ Produzir']
  ],
  profissoes: [
    ['profissoes', '👷 Visão geral'], ['zonas', '⛏️ Zonas de mineração'], ['minerar', '⛏️ Minerar'], ['forjareceitas', '🔨 Receitas de forja'], ['forjar', '🔨 Forjar'],
    ['projetos', '🏗️ Projetos'], ['construir', '🏗️ Construir'], ['contratos', '🚚 Contratos'], ['contrato', '🚚 Novo contrato'], ['entregar', '📦 Entregar'],
    ['equipamentos', '🔧 Equipamentos'], ['oficina', '🧰 Oficina'], ['reparar', '🔧 Reparar'], ['melhorar', '⬆️ Melhorar'], ['estoque', '🛒 Estoque'], ['comprar', '🛒 Comprar'], ['vender', '💰 Vender']
  ],
  mercado: [
    ['mercado', '📈 Mercado local'], ['comprarmercado', '🛒 Comprar local'], ['vendermercado', '💰 Vender local'], ['minhasordens', '📋 Minhas ordens'], ['cancelarordem', '❌ Cancelar ordem'], ['mercadostats', '📊 Estatísticas'],
    ['mercadointernacional', '🌐 Mercado internacional'], ['comprarinternacional', '🌐 Comprar internacional'], ['venderinternacional', '🌐 Vender internacional'], ['minhasordensinternacionais', '📋 Ordens internacionais'], ['cancelarordeminternacional', '❌ Cancelar internacional'], ['mercadosglobais', '🌍 Mercados globais'],
    ['fretes', '🚚 Fretes'], ['aceitarfrete', '✅ Aceitar frete'], ['meusfretes', '📦 Meus fretes'], ['entregarfrete', '🚚 Entregar frete'],
    ['mercadoequipamentos', '🛡️ Mercado estratégico'], ['comprarestrategico', '🛡️ Comprar estratégico'], ['venderestrategico', '🛡️ Vender estratégico'], ['fretespesados', '🚛 Fretes pesados'], ['aceitarfretepesado', '🚛 Aceitar frete pesado'], ['entregarfretepesado', '🚛 Entregar frete pesado'], ['centralmercado', '🧭 Central do mercado'], ['auditarmercado', '🔍 Auditoria do mercado']
  ],
  industria: [
    ['industriaestrategica', '🏭 Indústria estratégica'], ['instalacoes', '🏭 Instalações'], ['melhorarinstalacao', '⬆️ Melhorar instalação'], ['receitasestrategicas', '📜 Receitas estratégicas'], ['produzirestrategico', '⚙️ Produzir estratégico'], ['armazenamentoestrategico', '📦 Armazenamento estratégico'], ['politicaestrategica', '🌐 Política estratégica'], ['auditarindustria', '🔍 Auditar indústria'],
    ['industriamilitar', '🏭 Indústria militar'], ['complexosmilitares', '🏗️ Complexos'], ['construircomplexo', '🏗️ Construir complexo'], ['pesquisasmilitares', '🔬 Pesquisas'], ['financiarpesquisa', '💰 Financiar pesquisa'], ['desbloqueartecnologia', '🔓 Desbloquear tecnologia'], ['producaomilitarnacional', '⚙️ Produção nacional'], ['estoquenacional/listar', '📦 Estoque nacional'], ['estoquenacional/depositar', '📥 Depositar no estoque'], ['estoquenacional/retirar', '📤 Retirar do estoque'], ['manutencaomilitar/unidade', '🔧 Manutenção de unidade'], ['manutencaomilitar/ativo', '🛠️ Manutenção de ativo'], ['auditarindustriamilitar', '🔍 Auditoria militar']
  ],
  pais: [
    ['pais', '🏳️ Meu país'], ['criarpais', '➕ Criar país'], ['entrarpais', '🚪 Entrar no país'], ['mundo', '🌍 Mundo'], ['territorios', '🗺️ Territórios'], ['territorio', '🔎 Ver território'], ['fronteiras', '🧭 Fronteiras'], ['recursosterritoriais', '⛏️ Recursos territoriais'], ['reivindicarterritorio', '🏳️ Reivindicar'], ['melhorarinfraestrutura', '🏗️ Infraestrutura']
  ],
  forcas: [
    ['forcasarmadas', '🪖 Visão geral'], ['recrutarunidade', '➕ Recrutar'], ['unidadesmilitares', '👥 Unidades'], ['treinarunidade', '🎯 Treinar'], ['estacionarunidade', '🗺️ Estacionar'], ['ativosmilitares', '🛡️ Ativos'], ['incorporarativo', '➕ Incorporar ativo']
  ],
  guerra: [
    ['guerra', '⚔️ Conflitos'], ['declararguerra', '🚨 Declarar guerra'], ['atacar', '⚔️ Atacar'], ['defesaterritorial', '🛡️ Defesa territorial'], ['batalhas', '📜 Batalhas'], ['encerrarguerra', '🏁 Encerrar guerra']
  ],
  diplomacia: [
    ['diplomacia', '🤝 Visão geral'], ['relacoes', '🌐 Relações'], ['criaralianca', '🤝 Criar aliança'], ['convidaralianca', '✉️ Convidar para aliança'], ['aceitaralianca', '✅ Aceitar aliança'], ['proportratado', '📜 Propor tratado'], ['aceitartratado', '✅ Aceitar tratado'], ['embargo', '🚫 Embargo'], ['sancao', '📉 Sanção']
  ],
  mundial: [
    ['guerramundial', '🌐 Situação mundial'], ['iniciarguerramundial', '⚔️ Iniciar guerra mundial'], ['aderirguerramundial', '🏳️ Aderir'], ['encerrarguerramundial', '🏁 Encerrar'], ['economiamundial', '💹 Economia mundial'], ['rankingmundial', '🏆 Ranking mundial'], ['eventomundial/listar', '🌍 Eventos'], ['eventomundial/gerar', '🌪️ Gerar evento'], ['auditarguerramundial', '🔍 Auditoria mundial']
  ]
};

const meta = {
  inventario: ['🎒 Inventário', 'Inventário e armazenamentos em um único painel.'],
  producao: ['🏭 Produção', 'Recursos, produtos, receitas e fabricação.'],
  profissoes: ['🧑‍🔧 Profissões', 'Todas as profissões e suas ações.'],
  mercado: ['📈 Mercado', 'Mercado local, internacional, estratégico e logística.'],
  industria: ['🏭 Indústria', 'Indústria estratégica, pesquisa, complexos e estoque nacional.'],
  pais: ['🏳️ País', 'País, mundo, territórios e infraestrutura.'],
  forcas: ['🪖 Forças Armadas', 'Unidades, treinamento, posicionamento e ativos.'],
  guerra: ['⚔️ Guerra', 'Conflitos, ataques, defesa e histórico de batalhas.'],
  diplomacia: ['🤝 Diplomacia', 'Relações, alianças, tratados e restrições.'],
  mundial: ['🌐 Mundial', 'Guerra mundial, economia global, ranking e eventos.']
};

function actionSelect(panel) {
  const actions = PANEL_ACTIONS[panel] ?? [];
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`hub:action:${panel}`)
      .setPlaceholder('Escolha uma ação')
      .addOptions(actions.map(([value, label]) => ({ label: label.replace(/^\S+\s*/, ''), value, emoji: label.split(' ')[0], description: `Executar ${value}`.slice(0, 100) })))
  );
}

function shortcuts(panel) {
  const target = ({ inventario:'inventory', producao:'production', mercado:'market', pais:'world', forcas:'military', guerra:'warfare', diplomacia:'diplomacy', mundial:'globalWar', industria:'militaryIndustry', profissoes:'professions' })[panel];
  if (!target) return null;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`hub:view:${target}`).setLabel('Visão geral').setEmoji('📊').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`hub:panel:${panel}`).setLabel('Atualizar painel').setEmoji('🔄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('hub:view:home').setLabel('Início').setEmoji('🏠').setStyle(ButtonStyle.Secondary)
  );
}

export function renderEconomyPanel(user) {
  const b = economy.balances(user.id);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('💰 Painel de Economia')
    .setDescription(`Economia de **${user.username}**. Todas as operações ficam neste único comando.`)
    .addFields(
      { name:'👛 Carteira', value:`$ ${money(b.wallet)}`, inline:true },
      { name:'🏦 Banco', value:`$ ${money(b.bank)}`, inline:true },
      { name:'💵 Total', value:`$ ${money(b.total)}`, inline:true }
    );
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('hub:economy:balance').setLabel('Saldo').setEmoji('💰').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:open:deposit').setLabel('Depositar').setEmoji('📥').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('tnt:open:withdraw').setLabel('Sacar').setEmoji('📤').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:open:transfer').setLabel('Transferir').setEmoji('💸').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('hub:economy:transactions').setLabel('Transações').setEmoji('📜').setStyle(ButtonStyle.Secondary)
  );
  return { embeds:[embed], components:[row1] };
}

export function renderTradePanel() {
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🔄 Trocas entre jogadores')
    .setDescription('Proponha, acompanhe e responda trocas P2P sem precisar de vários slash commands.');
  const select = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('hub:action:trocas').setPlaceholder('Escolha uma ação de troca').addOptions(
    {label:'Propor troca', value:'trocar/propor', emoji:'🔄'}, {label:'Minhas trocas', value:'trocar/minhas', emoji:'📋'}, {label:'Aceitar', value:'trocar/aceitar', emoji:'✅'}, {label:'Recusar', value:'trocar/recusar', emoji:'❌'}, {label:'Cancelar', value:'trocar/cancelar', emoji:'🚫'}
  ));
  return { embeds:[embed], components:[select] };
}

export function renderConfigPanel(guildId) {
  const cfg = guildId ? channels.get(guildId) : {};
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('⚙️ Configuração do Jogo').setDescription('Configure os canais públicos sem vários comandos.')
    .addFields(
      {name:'📈 Mercado', value:cfg.market ? `<#${cfg.market}>` : 'Não configurado', inline:true},
      {name:'🔄 Trocas', value:cfg.trades ? `<#${cfg.trades}>` : 'Não configurado', inline:true},
      {name:'🚨 Guerra', value:cfg.war ? `<#${cfg.war}>` : 'Não configurado', inline:true},
      {name:'🌐 Mundial', value:cfg.world ? `<#${cfg.world}>` : 'Não configurado', inline:true}
    );
  const type = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('hub:config:type').setPlaceholder('1. Escolha o tipo de canal').addOptions(
    {label:'Mercado',value:'market',emoji:'📈'}, {label:'Trocas',value:'trades',emoji:'🔄'}, {label:'Guerra',value:'war',emoji:'🚨'}, {label:'Mundial',value:'world',emoji:'🌐'}
  ));
  const channel = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('hub:config:channel').setPlaceholder('2. Escolha o canal').setChannelTypes(ChannelType.GuildText));
  const actions = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('hub:config:save').setLabel('Salvar seleção').setEmoji('💾').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('hub:config:remove').setLabel('Remover').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('hub:config:test').setLabel('Testar').setEmoji('🧪').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('hub:config:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Secondary)
  );
  return { embeds:[embed], components:[type, channel, actions] };
}

export function renderUnifiedPanel(panel, user, guildId = null) {
  if (panel === 'economia') return renderEconomyPanel(user);
  if (panel === 'trocas') return renderTradePanel();
  if (panel === 'configurar') return renderConfigPanel(guildId);
  if (panel === 'game') return renderPage('home', user);
  const [title, description] = meta[panel] ?? ['🎮 Painel', 'Selecione uma ação.'];
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle(title).setDescription(`${description}\n\nUse **Visão geral** ou selecione uma ação abaixo.`);
  const components = [actionSelect(panel)];
  const row = shortcuts(panel); if (row) components.push(row);
  return { embeds:[embed], components };
}

export { PANEL_ACTIONS };

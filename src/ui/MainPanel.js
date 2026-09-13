import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} from 'discord.js';
import { EMBED_COLOR, MAX_ENERGY } from '../config/settings.js';
import { ProfileManager } from '../players/ProfileManager.js';
import { ProgressionManager } from '../players/ProgressionManager.js';
import { StatisticsManager } from '../players/StatisticsManager.js';
import { WealthManager } from '../players/WealthManager.js';
import { InventoryManager } from '../inventory/InventoryManager.js';
import { StorageManager } from '../storage/StorageManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
import { EconomyService } from '../economy/EconomyService.js';
import { RecipeRegistry } from '../production/RecipeRegistry.js';
import { ProfessionManager } from '../professions/ProfessionManager.js';
import { listProfessions } from '../professions/registry.js';
import { MarketOrderManager } from '../market/MarketOrderManager.js';
import { MarketPricing } from '../market/MarketPricing.js';
import { MarketHubService } from '../market/MarketHubService.js';
import { MarketIntegrityManager } from '../market/MarketIntegrityManager.js';
import { WorldHubService } from '../world/WorldHubService.js';
import { ArmedForcesHubService } from '../military/ArmedForcesHubService.js';
import { MilitaryIndustryHubService } from '../military_industry/MilitaryIndustryHubService.js';
import { WarHubService } from '../warfare/WarHubService.js';
import { DiplomacyHubService } from '../diplomacy/DiplomacyHubService.js';
import { WorldWarHubService } from '../global_war/WorldWarHubService.js';

const profiles = new ProfileManager();
const progression = new ProgressionManager(profiles);
const statistics = new StatisticsManager();
const items = new ItemRegistry();
const inventory = new InventoryManager(undefined, items);
const storage = new StorageManager(undefined, items);
const economy = new EconomyService();
const wealth = new WealthManager({ economy, inventory, storage, items });
const recipes = new RecipeRegistry();
const professions = new ProfessionManager();
const marketOrders = new MarketOrderManager();
const marketPricing = new MarketPricing();
const marketHub = new MarketHubService();
const marketIntegrity = new MarketIntegrityManager();
const worldHub = new WorldHubService();
const armedForces = new ArmedForcesHubService();
const militaryIndustry = new MilitaryIndustryHubService();
const warfare = new WarHubService();
const diplomacy = new DiplomacyHubService();
const globalWar = new WorldWarHubService();

const money = (value) => Number(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const trim = (text, max = 1000) => String(text ?? '').slice(0, max);
const pct = (n) => `${Math.round(Number(n ?? 0) * 100)}%`;

function navRows(page = 'home') {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tnt:page:home').setLabel('Início').setEmoji('🌍').setStyle(page === 'home' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:page:economy').setLabel('Economia').setEmoji('💰').setStyle(page === 'economy' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:page:inventory').setLabel('Inventário').setEmoji('🎒').setStyle(page === 'inventory' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:page:production').setLabel('Produção').setEmoji('🏭').setStyle(page === 'production' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:page:professions').setLabel('Profissões').setEmoji('🧑‍🔧').setStyle(page === 'professions' ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tnt:page:market').setLabel('Mercado').setEmoji('📈').setStyle(page === 'market' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:page:storage').setLabel('Armazéns').setEmoji('📦').setStyle(page === 'storage' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:page:world').setLabel('Mundo').setEmoji('🌍').setStyle(page === 'world' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:page:military').setLabel('Forças').setEmoji('🪖').setStyle(page === 'military' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`tnt:refresh:${page}`).setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Success)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tnt:page:militaryIndustry').setLabel('Indústria Militar').setEmoji('🏭').setStyle(page === 'militaryIndustry' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:page:warfare').setLabel('Guerra').setEmoji('⚔️').setStyle(page === 'warfare' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:page:diplomacy').setLabel('Diplomacia').setEmoji('🤝').setStyle(page === 'diplomacy' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:page:globalWar').setLabel('Guerra Mundial').setEmoji('🌐').setStyle(page === 'globalWar' ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );
  return [row1, row2, row3];
}

function homeEmbed(user) {
  const profile = profiles.getOrCreate(user.id, user.username);
  const progress = progression.getProgress(user.id);
  const stats = statistics.get(user.id);
  const assets = wealth.calculate(user.id);
  const xpPercent = progress?.required > 0 ? Math.min(100, Math.floor((progress.xp / progress.required) * 100)) : 0;
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle('🌍 TNT • Painel Principal')
    .setDescription(`Central de jogo de **${user.username}**. Use os botões abaixo para navegar sem precisar decorar comandos.`)
    .addFields(
      { name: '📈 Progressão', value: `Nível **${profile.level}**\nXP **${progress?.xp ?? 0}/${progress?.required ?? 0}** (${xpPercent}%)`, inline: true },
      { name: '⚡ Energia', value: `**${profile.energy}/${MAX_ENERGY}**`, inline: true },
      { name: '🧑‍🔧 Profissão', value: `**${profile.profession ?? 'Nenhuma'}**`, inline: true },
      { name: '💰 Economia', value: `Carteira: **$ ${money(assets.wallet)}**\nBanco: **$ ${money(assets.bank)}**\nPatrimônio: **$ ${money(assets.total)}**`, inline: false },
      { name: '📊 Estatísticas', value: `Recursos: **${stats.resources_collected ?? 0}** • Produções: **${stats.items_produced ?? 0}** • Transações: **${stats.transactions ?? 0}**`, inline: false }
    )
    .setThumbnail(user.displayAvatarURL())
    .setFooter({ text: 'Node.js/JavaScript • Fase 9.2 Interface Unificada' })
    .setTimestamp();
}

function economyPage(userId) {
  const b = economy.balances(userId);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('💰 Economia').addFields(
    { name: '👛 Carteira', value: `$ ${money(b.wallet)}`, inline: true },
    { name: '🏦 Banco', value: `$ ${money(b.bank)}`, inline: true },
    { name: '💵 Total líquido', value: `$ ${money(b.total)}`, inline: true }
  ).setDescription('Gerencie banco e transferências pelos botões abaixo.');
  const actions = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tnt:open:deposit').setLabel('Depositar').setEmoji('📥').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('tnt:open:withdraw').setLabel('Sacar').setEmoji('📤').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tnt:open:transfer').setLabel('Transferir').setEmoji('💸').setStyle(ButtonStyle.Primary)
  );
  return { embeds: [embed], components: [...navRows('economy'), actions] };
}

function inventoryPage(userId) {
  const list = inventory.listItems(userId);
  const used = inventory.getUsedCapacity(userId), max = inventory.getMaxCapacity(userId);
  const lines = list.slice(0, 18).map(x => `${x.emoji} **${x.name}** ×${x.quantity} • Q${x.quality} • ${x.weight} peso`);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🎒 Inventário').setDescription(lines.length ? trim(lines.join('\n'), 3900) : 'Seu inventário está vazio.').addFields({ name: '📦 Capacidade', value: `**${used}/${max}** • Livre: **${inventory.getFreeCapacity(userId)}**` });
  const actions = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tnt:open:store').setLabel('Guardar').setEmoji('➡️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('tnt:open:retrieve').setLabel('Retirar').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [...navRows('inventory'), actions] };
}

function storagePage(userId, type = 'warehouse') {
  const labels = { warehouse: ['🏬', 'Armazém'], industrial: ['🏭', 'Estoque Industrial'], garage: ['🚗', 'Garagem'] };
  const [emoji, title] = labels[type] ?? labels.warehouse;
  const list = storage.listItems(userId, type);
  const lines = list.slice(0, 18).map(x => `${x.emoji ?? '📦'} **${x.name}** ×${x.quantity} • Q${x.quality}`);
  const unit = type === 'garage' ? 'vagas' : 'capacidade';
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle(`${emoji} ${title}`).setDescription(lines.length ? trim(lines.join('\n'), 3900) : 'Nenhum item armazenado.').addFields({ name: '📊 Capacidade', value: `**${storage.getUsedCapacity(userId, type)}/${storage.getMaxCapacity(userId, type)}** ${unit}\nLivre: **${storage.getFreeCapacity(userId, type)}**` });
  const select = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('tnt:select:storage').setPlaceholder('Selecione o armazenamento').addOptions(
    { label: 'Armazém', value: 'warehouse', emoji: '🏬', default: type === 'warehouse' },
    { label: 'Industrial', value: 'industrial', emoji: '🏭', default: type === 'industrial' },
    { label: 'Garagem', value: 'garage', emoji: '🚗', default: type === 'garage' }
  ));
  return { embeds: [embed], components: [...navRows('storage'), select] };
}

function productionPage() {
  const all = recipes.listAll();
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🏭 Produção').setDescription(`Há **${all.length} receitas** carregadas. Escolha uma receita no menu para ver detalhes e produzir.`);
  const options = all.slice(0, 25).map(r => ({ label: String(r.name ?? r.id).slice(0, 100), value: String(r.id), description: `${r.category ?? 'produção'} • Nv. ${r.required_level ?? 1}`.slice(0, 100) }));
  const components = [...navRows('production')];
  if (options.length) components.push(new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('tnt:select:recipe').setPlaceholder('Selecione uma receita').addOptions(options)));
  return { embeds: [embed], components };
}

function recipePage(recipeId) {
  const r = recipes.get(recipeId);
  if (!r) return productionPage();
  const inputs = Object.entries(r.inputs ?? {}).map(([id, q]) => `• ${items.get(id)?.name ?? id} ×${q}`).join('\n') || 'Nenhum';
  const outputId = r.output?.item_id;
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle(`📜 ${r.name ?? r.id}`).addFields(
    { name: 'Categoria', value: String(r.category ?? '—'), inline: true },
    { name: 'Nível', value: String(r.required_level ?? 1), inline: true },
    { name: 'Energia', value: String(r.energy_cost ?? 0), inline: true },
    { name: 'Entradas', value: trim(inputs), inline: false },
    { name: 'Saída', value: `${items.get(outputId)?.name ?? outputId} ×${r.output?.quantity ?? 1}`, inline: false }
  );
  const actions = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`tnt:open:produce:${r.id}`).setLabel('Produzir').setEmoji('⚙️').setStyle(ButtonStyle.Success));
  return { embeds: [embed], components: [...navRows('production'), actions] };
}

function professionsPage(userId) {
  const list = listProfessions();
  const lines = list.map(p => { const s = professions.get(userId, p.id); return `${p.emoji} **${p.name}** • Nv. ${s?.level ?? 1} • XP ${s?.xp ?? 0} • Ações ${s?.actions ?? 0}`; });
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🧑‍🔧 Profissões').setDescription(lines.join('\n'));
  const select = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('tnt:select:profession').setPlaceholder('Detalhes de uma profissão').addOptions(list.map(p => ({ label: p.name, value: p.id, emoji: p.emoji, description: p.description.slice(0, 100) }))));
  return { embeds: [embed], components: [...navRows('professions'), select] };
}

function professionPage(userId, professionId) {
  const p = listProfessions().find(x => x.id === professionId);
  if (!p) return professionsPage(userId);
  const s = professions.get(userId, professionId);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle(`${p.emoji} ${p.name}`).setDescription(p.description).addFields(
    { name: 'Nível', value: String(s?.level ?? 1), inline: true },
    { name: 'XP', value: String(s?.xp ?? 0), inline: true },
    { name: 'Ações', value: String(s?.actions ?? 0), inline: true },
    { name: 'Ganhos', value: `$ ${money(s?.total_earned ?? 0)}`, inline: true }
  ).setFooter({ text: 'As ações específicas continuam disponíveis pelos comandos slash da profissão.' });
  return { embeds: [embed], components: navRows('professions') };
}

function marketPage(userId) {
  const d = marketHub.dashboard(userId);
  const audit = marketIntegrity.audit();
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('📈 Mercado Avançado • Integração Final').setDescription('Mercado local, internacional, escrow, histórico e logística P2P agora usam uma central integrada.').addFields(
    { name: '📍 Mercado local', value: `🟥 ${d.local.sell_orders} venda(s) • 🟩 ${d.local.buy_orders} compra(s)`, inline: false },
    { name: '🌐 Mercado internacional', value: `🟥 ${d.international.sell_orders} venda(s) • 🟩 ${d.international.buy_orders} compra(s)`, inline: false },
    { name: '🚚 Logística', value: `Aguardando: **${d.logistics.awaiting_carrier}** • Em trânsito: **${d.logistics.in_transit}** • Entregues: **${d.logistics.delivered}**`, inline: false },
    { name: '👤 Sua atividade', value: `Local: ${d.user.local_sell} venda(s) / ${d.user.local_buy} compra(s)
Internacional: ${d.user.international_sell} venda(s) / ${d.user.international_buy} compra(s)`, inline: false },
    { name: '🧪 Integridade', value: audit.ok ? '✅ Sistema consistente' : `⚠️ ${audit.issues.length} inconsistência(s)`, inline: true }
  );
  const actions = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tnt:open:marketSell').setLabel('Criar venda').setEmoji('📤').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('tnt:open:marketBuy').setLabel('Criar compra').setEmoji('📥').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('tnt:open:marketLookup').setLabel('Consultar item').setEmoji('🔎').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('tnt:open:intSell').setLabel('Venda internacional').setEmoji('🌐').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('tnt:open:intBuy').setLabel('Compra internacional').setEmoji('🌍').setStyle(ButtonStyle.Success)
  );
  return { embeds: [embed], components: [...navRows('market'), actions] };
}

function marketItemPage(itemId) {
  const item = items.get(itemId);
  if (!item) return null;
  const s = marketHub.itemSummary(itemId);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle(`📊 ${item.emoji ?? '📦'} ${item.name ?? itemId}`).addFields(
    { name: 'Preço base', value: `$ ${money(s.base_price)}`, inline: true },
    { name: 'Último', value: `$ ${money(s.last_price)}`, inline: true },
    { name: 'Referência', value: `$ ${money(s.reference_price)}`, inline: true },
    { name: 'Melhor compra', value: s.best_buy == null ? '—' : `$ ${money(s.best_buy)}`, inline: true },
    { name: 'Melhor venda', value: s.best_sell == null ? '—' : `$ ${money(s.best_sell)}`, inline: true },
    { name: 'Pressão', value: String(s.pressure ?? 'equilibrado'), inline: true },
    { name: '🌐 Melhor compra internacional', value: s.international_best_buy == null ? '—' : `$ ${money(s.international_best_buy)}`, inline: true },
    { name: '🌐 Melhor venda internacional', value: s.international_best_sell == null ? '—' : `$ ${money(s.international_best_sell)}`, inline: true }
  );
  return { embeds: [embed], components: navRows('market') };
}

function worldPage(userId) {
  const d = worldHub.dashboard(userId);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🌍 Países e Territórios').setDescription('Mapa político e territorial da Fase 4.').addFields(
    { name: '🏳️ Países', value: String(d.countries), inline: true },
    { name: '🗺️ Territórios', value: String(d.territories), inline: true },
    { name: '⚪ Neutros', value: String(d.neutral), inline: true },
    { name: '🧭 Fronteiras', value: String(d.borders), inline: true },
    { name: 'Seu país', value: d.country ? `${d.country.emoji} **${d.country.name}** (${d.country.code})` : 'Nenhum país', inline: false },
    { name: 'Controle territorial', value: d.country ? `Propriedade: **${d.owned}** • Controle: **${d.controlled}** • Infraestrutura: **${d.infrastructure_score}**` : 'Use /entrarpais ou /criarpais.', inline: false }
  );
  return { embeds: [embed], components: navRows('world') };
}


function militaryIndustryPage(userId) {
  const d = militaryIndustry.dashboard(userId);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🏭 Indústria Militar').setDescription('Fase 6: complexos nacionais, pesquisa, tecnologia, produção, manutenção e estoques fictícios.');
  if (!d.country) embed.addFields({ name: 'País', value: 'Você ainda não pertence a um país.' });
  else embed.addFields(
    { name: '🏳️ País', value: `${d.country.emoji} **${d.country.name}**`, inline: false },
    { name: '🔬 Pesquisa', value: `Pontos: **${d.research.points}** • Tecnologias: **${d.technologies.unlocked}/${d.technologies.total}**`, inline: true },
    { name: '🏭 Complexos', value: `**${d.complexes.length}** construído(s)`, inline: true },
    { name: '📦 Estoque nacional', value: `**${d.stockpile.used}/${d.stockpile.capacity}** • ${d.stockpile.items} item(ns)`, inline: true },
    { name: '⚙️ Produção', value: `Receitas liberadas: **${d.recipes.unlocked}/${d.recipes.total}**
Bônus: **${Math.round(d.bonuses.production * 100)}%**`, inline: true },
    { name: '🔧 Manutenção', value: `Bônus: **${Math.round(d.bonuses.maintenance * 100)}%**`, inline: true },
    { name: '🧪 Centros de pesquisa', value: `Bônus: **${Math.round(d.bonuses.research * 100)}%**`, inline: true }
  );
  return { embeds: [embed], components: navRows('militaryIndustry') };
}



function warfarePage(userId) {
  const d = warfare.dashboard(userId);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('⚔️ Guerra e Combate').setDescription('Fase 7: conflitos e batalhas territoriais resolvidos por estatísticas abstratas de jogo.');
  if (!d.country) embed.addFields({ name: 'País', value: 'Você ainda não pertence a um país.' });
  else embed.addFields(
    { name: '🏳️ País', value: `${d.country.emoji} **${d.country.name}**`, inline: false },
    { name: '⚔️ Conflitos ativos', value: String(d.active_conflicts), inline: true },
    { name: '📜 Batalhas', value: String(d.battles), inline: true },
    { name: '🗺️ Territórios controlados', value: String(d.controlled), inline: true },
    { name: '📉 Efeitos econômicos', value: `Registros: **${d.effects.effects}**
Penalidade média de produção: **${Math.round(d.effects.average_production_penalty * 100)}%**`, inline: false }
  );
  return { embeds: [embed], components: navRows('warfare') };
}


function diplomacyPage(userId) {
  const d = diplomacy.dashboard(userId);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🤝 Diplomacia').setDescription('Fase 8: alianças, tratados, relações internacionais, embargos e sanções abstratas de jogo.');
  if (!d.country) embed.addFields({ name: 'País', value: 'Você ainda não pertence a um país.' });
  else embed.addFields(
    { name: '🏳️ País', value: `${d.country.emoji} **${d.country.name}**`, inline: false },
    { name: '🤝 Aliança', value: d.alliance ? `**${d.alliance.name}** [${d.alliance.tag}] • ${d.alliance.member_country_ids.length} membro(s)` : 'Nenhuma', inline: false },
    { name: '📜 Tratados', value: `Ativos: **${d.summary.active_treaties}** • Pendentes: **${d.summary.pending_treaties}**`, inline: true },
    { name: '🚫 Restrições', value: `**${d.summary.active_restrictions}** ativa(s)`, inline: true },
    { name: '🌐 Relações', value: d.relations.length ? d.relations.slice(0, 6).map(r => `• ${r.country_id}: **${r.score}** (${r.status})`).join('\n') : 'Sem relações registradas.', inline: false }
  );
  return { embeds: [embed], components: navRows('diplomacy') };
}


function globalWarPage(userId) {
  const d = globalWar.dashboard(userId);
  const warLines = d.active_wars.slice(0, 4).map(w => `• **${w.name}** • ${w.side_a.label} **${w.score_a}×${w.score_b}** ${w.side_b.label}`).join('\n') || 'Nenhuma guerra mundial ativa.';
  const eventLines = d.events.slice(0, 4).map(e => `${e.emoji} ${e.name}`).join('\n') || 'Nenhum evento ativo.';
  const rankLines = d.rankings.slice(0, 5).map(r => `${r.rank}. ${r.emoji} ${r.name} • **${r.score}**`).join('\n') || 'Sem ranking.';
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🌐 Guerra Mundial').setDescription('Fase 9: integração global de países, alianças, guerra, território, economia e eventos mundiais.').addFields(
    { name: '🌍 Situação global', value: `Países: **${d.economy.countries}** • Territórios controlados: **${d.economy.controlled_territories}/${d.economy.territories}**\nEstabilidade mundial: **${d.economy.stability_index}/100**`, inline: false },
    { name: '⚔️ Guerras mundiais', value: warLines, inline: false },
    { name: '📈 Mercado global', value: `Negociações: **${d.economy.market_trades}** • Volume: **$ ${money(d.economy.market_volume)}**`, inline: true },
    { name: '🌪️ Eventos mundiais', value: eventLines, inline: true },
    { name: '🏆 Top países', value: rankLines, inline: false },
    { name: '🏳️ Seu país', value: d.country ? `${d.country.emoji} **${d.country.name}**${d.alliance ? ` • ${d.alliance.name} [${d.alliance.tag}]` : ''}` : 'Nenhum país', inline: false }
  );
  return { embeds: [embed], components: navRows('globalWar') };
}

function militaryPage(userId) {
  const d = armedForces.dashboard(userId);
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🪖 Forças Armadas').setDescription('Estrutura militar fictícia da Fase 5. Combate ainda não é resolvido nesta fase.');
  if (!d.country) embed.addFields({ name: 'País', value: 'Você ainda não pertence a um país.' });
  else embed.addFields(
    { name: '🏳️ País', value: `${d.country.emoji} **${d.country.name}**`, inline: false },
    { name: '🪖 Unidades', value: `Total: **${d.units.total}** • Prontidão média: **${d.units.average_readiness}%**`, inline: true },
    { name: '🛡️ Ativos', value: `Total: **${d.assets.total}** • Ativos: **${d.assets.active}** • Reserva: **${d.assets.reserve}**`, inline: true },
    { name: 'Ramos', value: `🪖 Exército: ${d.units.by_branch.army ?? 0}
✈️ Força Aérea: ${d.units.by_branch.air_force ?? 0}
⚓ Marinha: ${d.units.by_branch.navy ?? 0}
🛰️ Estratégico: ${d.units.by_branch.strategic ?? 0}` }
  );
  return { embeds: [embed], components: navRows('military') };
}

export function renderPage(page, user, arg = null) {
  if (page === 'economy') return economyPage(user.id);
  if (page === 'inventory') return inventoryPage(user.id);
  if (page === 'storage') return storagePage(user.id, arg ?? 'warehouse');
  if (page === 'production') return arg ? recipePage(arg) : productionPage();
  if (page === 'professions') return arg ? professionPage(user.id, arg) : professionsPage(user.id);
  if (page === 'world') return worldPage(user.id);
  if (page === 'military') return militaryPage(user.id);
  if (page === 'militaryIndustry') return militaryIndustryPage(user.id);
  if (page === 'warfare') return warfarePage(user.id);
  if (page === 'diplomacy') return diplomacyPage(user.id);
  if (page === 'globalWar') return globalWarPage(user.id);
  if (page === 'market') return arg ? (marketItemPage(arg) ?? marketPage(user.id)) : marketPage(user.id);
  return { embeds: [homeEmbed(user)], components: navRows('home') };
}

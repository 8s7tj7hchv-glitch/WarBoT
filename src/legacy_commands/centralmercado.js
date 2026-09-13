import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { MarketHubService } from '../market/MarketHubService.js';
import { MarketIntegrityManager } from '../market/MarketIntegrityManager.js';

const hub = new MarketHubService();
const integrity = new MarketIntegrityManager();

export const data = new SlashCommandBuilder()
  .setName('centralmercado')
  .setDescription('Mostra o painel integrado do mercado local, internacional e logística.');

export async function execute(interaction) {
  const d = hub.dashboard(interaction.user.id, interaction.guildId);
  const audit = integrity.audit();
  const embed = new EmbedBuilder()
    .setTitle('🔗 Central Integrada de Mercado')
    .setDescription('Resumo do Mercado Avançado — Fase 3 concluída.')
    .addFields(
      { name: '📈 Mercado local', value: `Vendas: **${d.local.sell_orders}**\nCompras: **${d.local.buy_orders}**`, inline: true },
      { name: '🌐 Internacional', value: `Vendas: **${d.international.sell_orders}**\nCompras: **${d.international.buy_orders}**`, inline: true },
      { name: '🚚 Logística', value: `Aguardando: **${d.logistics.awaiting_carrier}**\nEm trânsito: **${d.logistics.in_transit}**\nEntregues: **${d.logistics.delivered}**`, inline: true },
      { name: '📚 Histórico', value: `Trades: **${d.trades.total}**\nLocal: **${d.trades.local}** • Internacional: **${d.trades.international}**`, inline: true },
      { name: '👤 Sua atividade', value: `Local: ${d.user.local_sell} venda(s), ${d.user.local_buy} compra(s)\nInternacional: ${d.user.international_sell} venda(s), ${d.user.international_buy} compra(s)\nFretes em trânsito: ${d.user.freight_in_transit}`, inline: true },
      { name: '🧪 Integridade', value: audit.ok ? '✅ Nenhuma inconsistência detectada.' : `⚠️ **${audit.issues.length}** inconsistência(s) detectada(s).`, inline: true }
    )
    .setTimestamp();
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

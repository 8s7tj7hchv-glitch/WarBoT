import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { InternationalOrderManager } from '../market/InternationalOrderManager.js';
import { GuildMarketRegistry } from '../market/GuildMarketRegistry.js';
import { ItemRegistry } from '../core/ItemRegistry.js';

const orders = new InternationalOrderManager();
const guilds = new GuildMarketRegistry();
const items = new ItemRegistry();

export const data = new SlashCommandBuilder()
  .setName('mercadointernacional')
  .setDescription('Mostra o mercado internacional entre servidores.')
  .addStringOption((o) => o.setName('item').setDescription('ID do item').setRequired(false));

export async function execute(interaction) {
  if (!interaction.guildId) return interaction.reply({ content: '❌ Use este comando dentro de um servidor.', flags: MessageFlags.Ephemeral });
  guilds.register(interaction.guildId, interaction.guild?.name ?? 'Servidor');
  const itemId = interaction.options.getString('item');
  if (itemId && !items.get(itemId)) return interaction.reply({ content: '❌ Item não encontrado.', flags: MessageFlags.Ephemeral });

  const sells = orders.listSell(itemId).slice(0, 8);
  const buys = orders.listBuy(itemId).slice(0, 8);
  const fmtSell = (o) => `🔴 ${items.getEmoji(o.item_id)} **${items.getName(o.item_id)}** • ${o.remaining} un. • $${Number(o.unit_price).toFixed(2)} • 🌐 ${o.origin_guild_name} • \`${o.id.slice(0, 8)}\``;
  const fmtBuy = (o) => `🟢 ${items.getEmoji(o.item_id)} **${items.getName(o.item_id)}** • ${o.remaining} un. • $${Number(o.unit_price).toFixed(2)} • 🌐 ${o.destination_guild_name} • \`${o.id.slice(0, 8)}\``;

  const embed = new EmbedBuilder()
    .setTitle('🌐 Mercado Internacional')
    .setDescription(itemId ? `Livro internacional para **${items.getName(itemId)}**.` : 'Ordens entre mercados de servidores diferentes. Ordens do mesmo servidor não fazem matching internacional.')
    .addFields(
      { name: '🟢 Compras internacionais', value: buys.length ? buys.map(fmtBuy).join('\n') : 'Nenhuma ordem.' },
      { name: '🔴 Vendas internacionais', value: sells.length ? sells.map(fmtSell).join('\n') : 'Nenhuma ordem.' }
    );
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

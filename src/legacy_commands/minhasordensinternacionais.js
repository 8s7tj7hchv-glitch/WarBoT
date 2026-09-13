import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { InternationalOrderManager } from '../market/InternationalOrderManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
const orders = new InternationalOrderManager();
const items = new ItemRegistry();

export const data = new SlashCommandBuilder().setName('minhasordensinternacionais').setDescription('Mostra suas ordens internacionais.');

export async function execute(interaction) {
  const rows = orders.listUser(interaction.user.id).slice(0, 20);
  const lines = rows.map((o) => {
    const side = o.type === 'sell' ? '🔴 VENDA' : '🟢 COMPRA';
    const market = o.type === 'sell' ? o.origin_guild_name : o.destination_guild_name;
    return `${side} • **${items.getName(o.item_id)}** • ${o.remaining}/${o.quantity} • $${Number(o.unit_price).toFixed(2)} • ${o.status} • 🌐 ${market} • \`${o.id.slice(0, 9)}\``;
  });
  await interaction.reply({ embeds: [new EmbedBuilder().setTitle('🌐 Minhas Ordens Internacionais').setDescription(lines.length ? lines.join('\n') : 'Nenhuma ordem internacional.')], ephemeral: true });
}

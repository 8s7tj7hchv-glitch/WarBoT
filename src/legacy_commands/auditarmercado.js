import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { MarketIntegrityManager } from '../market/MarketIntegrityManager.js';

const integrity = new MarketIntegrityManager();
export const data = new SlashCommandBuilder()
  .setName('auditarmercado')
  .setDescription('Audita ordens, escrow, trades e fretes do mercado.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const result = integrity.audit();
  const lines = result.issues.slice(0, 15).map(i => `• **${i.code}** • ${i.order_id ?? i.shipment_id ?? '—'}`);
  const embed = new EmbedBuilder()
    .setTitle('🧪 Auditoria do Mercado')
    .setDescription(result.ok ? '✅ Todos os vínculos principais estão consistentes.' : `⚠️ Foram encontradas **${result.issues.length}** inconsistências.\n\n${lines.join('\n')}`)
    .setFooter({ text: 'A auditoria é somente leitura e não altera dados.' })
    .setTimestamp();
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

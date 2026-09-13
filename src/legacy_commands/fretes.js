import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { LogisticsManager } from '../market/LogisticsManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
const logistics=new LogisticsManager(), items=new ItemRegistry();
export const data=new SlashCommandBuilder().setName('fretes').setDescription('Mostra fretes P2P disponíveis.');
export async function execute(interaction){const rows=logistics.listOpen(15);const text=rows.length?rows.map(s=>`🚚 ${items.getEmoji(s.item_id)} **${items.getName(s.item_id)}** ×${s.quantity} • ${s.weight} peso • recompensa $${s.reward.toFixed(2)} • \`${s.id.slice(0,10)}\``).join('\n'):'Nenhum frete disponível.';await interaction.reply({embeds:[new EmbedBuilder().setTitle('🚚 Central de Logística P2P').setDescription(text)],flags: MessageFlags.Ephemeral});}

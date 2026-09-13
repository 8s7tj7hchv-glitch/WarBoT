import { EmbedBuilder, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
import { CountryManager } from '../world/CountryManager.js';
const tm = new TerritoryManager(), cm = new CountryManager();
export default { data: new SlashCommandBuilder().setName('territorios').setDescription('Lista os territórios do mundo.'), async execute(i) { const lines = tm.list().map((t) => `${t.emoji} **${t.name}** • \`${t.id}\` • ${t.owner_country_id ? (cm.get(t.owner_country_id)?.name ?? 'País desconhecido') : 'Neutro'}`); const e = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🗺️ Territórios').setDescription(lines.join('\n').slice(0, 4000)); await i.reply({ embeds: [e], flags: MessageFlags.Ephemeral }); } };

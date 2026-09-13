import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { GuildMarketRegistry } from '../market/GuildMarketRegistry.js';
const guilds = new GuildMarketRegistry();

export const data = new SlashCommandBuilder().setName('mercadosglobais').setDescription('Lista mercados de servidores registrados no comércio internacional.');

export async function execute(interaction) {
  if (interaction.guildId) guilds.register(interaction.guildId, interaction.guild?.name ?? 'Servidor');
  const rows = guilds.listActive().slice(0, 25);
  const text = rows.length ? rows.map((g) => `🌐 **${g.guild_name}** • \`${g.guild_id}\``).join('\n') : 'Nenhum mercado de servidor registrado.';
  await interaction.reply({ embeds: [new EmbedBuilder().setTitle('🌐 Mercados Globais').setDescription(text)], flags: MessageFlags.Ephemeral });
}

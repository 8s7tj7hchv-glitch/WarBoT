import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { ResourceRegistry } from '../resources/ResourceRegistry.js';
import { EMBED_COLOR } from '../config/settings.js';
const registry = new ResourceRegistry();
export default {
  data: new SlashCommandBuilder().setName('recursos').setDescription('Lista os recursos disponíveis no jogo.'),
  async execute(interaction) {
    const counts = registry.countByCategory();
    const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('⛏️ Recursos').setDescription(`Total cadastrado: **${registry.count()}**`).addFields(
      { name: 'Matérias-primas', value: String(counts.raw_materials ?? 0), inline: true },
      { name: 'Minerais', value: String(counts.minerals ?? 0), inline: true },
      { name: 'Refinados', value: String(counts.refined_materials ?? 0), inline: true },
      { name: 'Industriais', value: String(counts.industrial_materials ?? 0), inline: true },
      { name: 'Especiais', value: String(counts.special_resources ?? 0), inline: true }
    );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};

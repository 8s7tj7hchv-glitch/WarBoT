import { SlashCommandBuilder } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mundial')
    .setDescription('Abre o painel mundial.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('mundial', interaction.user, interaction.guildId), ephemeral: true });
  }
};

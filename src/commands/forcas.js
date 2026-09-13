import { SlashCommandBuilder } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('forcas')
    .setDescription('Abre o painel das Forças Armadas.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('forcas', interaction.user, interaction.guildId), ephemeral: true });
  }
};

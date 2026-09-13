import { SlashCommandBuilder } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('game')
    .setDescription('Painel principal unificado do TNT.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('game', interaction.user, interaction.guildId), ephemeral: true });
  }
};

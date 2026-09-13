import { SlashCommandBuilder } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('industria')
    .setDescription('Abre o painel de indústria estratégica e militar.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('industria', interaction.user, interaction.guildId), ephemeral: true });
  }
};

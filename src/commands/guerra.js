import { SlashCommandBuilder } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('guerra')
    .setDescription('Abre o painel de guerra e combate.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('guerra', interaction.user, interaction.guildId), ephemeral: true });
  }
};

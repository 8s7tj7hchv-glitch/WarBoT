import { SlashCommandBuilder } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('trocas')
    .setDescription('Abre o painel de trocas entre jogadores.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('trocas', interaction.user, interaction.guildId), ephemeral: true });
  }
};

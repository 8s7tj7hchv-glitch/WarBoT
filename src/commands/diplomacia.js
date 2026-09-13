import { SlashCommandBuilder } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('diplomacia')
    .setDescription('Abre o painel de diplomacia.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('diplomacia', interaction.user, interaction.guildId), ephemeral: true });
  }
};

import { SlashCommandBuilder } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pais')
    .setDescription('Abre o painel de país e territórios.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('pais', interaction.user, interaction.guildId), ephemeral: true });
  }
};

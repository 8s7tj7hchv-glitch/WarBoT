import { SlashCommandBuilder } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profissoes')
    .setDescription('Abre o painel de profissões.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('profissoes', interaction.user, interaction.guildId), ephemeral: true });
  }
};

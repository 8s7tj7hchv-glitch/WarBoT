import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('producao')
    .setDescription('Abre o painel de produção.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('producao', interaction.user, interaction.guildId), flags: MessageFlags.Ephemeral });
  }
};

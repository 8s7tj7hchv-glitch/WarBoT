import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('economia')
    .setDescription('Abre o painel de economia.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('economia', interaction.user, interaction.guildId), flags: MessageFlags.Ephemeral });
  }
};

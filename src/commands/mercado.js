import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mercado')
    .setDescription('Abre o painel completo do mercado.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('mercado', interaction.user, interaction.guildId), flags: MessageFlags.Ephemeral });
  }
};

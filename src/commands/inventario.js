import { SlashCommandBuilder } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('inventario')
    .setDescription('Abre o painel de inventário e armazenamentos.'),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('inventario', interaction.user, interaction.guildId), ephemeral: true });
  }
};

import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { renderFactoriesPanel } from '../games/military-factories/ui/FactoriesPanel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('fabricas')
    .setDescription('Abre as Fábricas Militares da Guerra Mundial.'),

  async execute(interaction) {
    await interaction.reply({
      ...renderFactoriesPanel(interaction.user.id),
      flags: MessageFlags.Ephemeral
    });
  }
};

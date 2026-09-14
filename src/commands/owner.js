import { SlashCommandBuilder } from 'discord.js';
import { assertBotOwner } from '../owner/OwnerAccess.js';
import { renderOwnerPanel } from '../ui/OwnerPanel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('owner')
    .setDescription('Painel exclusivo do dono do bot.'),

  async execute(interaction) {
    try {
      assertBotOwner(interaction.user.id);
      await interaction.reply({ ...renderOwnerPanel(interaction.user), ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: `❌ ${error.message}`, ephemeral: true });
    }
  }
};

import { SlashCommandBuilder } from 'discord.js';
import { ProfileManager } from '../players/ProfileManager.js';
import { renderPage } from '../ui/MainPanel.js';

const profiles = new ProfileManager();

export default {
  data: new SlashCommandBuilder()
    .setName('game')
    .setDescription('Abre o painel principal interativo do TNT.'),

  async execute(interaction) {
    profiles.getOrCreate(interaction.user.id, interaction.user.username);
    await interaction.reply({ ...renderPage('home', interaction.user), ephemeral: true });
  }
};

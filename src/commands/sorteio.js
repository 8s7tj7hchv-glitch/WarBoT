import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildGiveawayMainPanel } from '../giveaways/panels/GiveawayMainPanel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('sorteio')
    .setDescription('Abre o painel principal do sistema de sorteios')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.reply({
      ...buildGiveawayMainPanel(),
      ephemeral: true
    });
  }
};

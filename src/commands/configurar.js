import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { renderUnifiedPanel } from '../ui/UnifiedPanels.js';

export default {
  data: new SlashCommandBuilder()
    .setName('configurar')
    .setDescription('Configura canais e notificações do jogo.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    await interaction.reply({ ...renderUnifiedPanel('configurar', interaction.user, interaction.guildId), flags: MessageFlags.Ephemeral });
  }
};

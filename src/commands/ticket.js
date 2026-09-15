import { PermissionFlagsBits, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getTicketConfig } from '../tickets/config/ticketConfig.js';
import { buildTicketAdminPanel } from '../tickets/panels/adminPanel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Abre o painel administrativo do sistema de tickets.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: '❌ Este comando só pode ser usado em servidores.', flags: MessageFlags.Ephemeral });
    }

    const config = getTicketConfig(interaction.guildId);
    return interaction.reply({ ...buildTicketAdminPanel(config), flags: MessageFlags.Ephemeral });
  },
};

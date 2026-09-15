import { PermissionFlagsBits, MessageFlags } from 'discord.js';
import { sendTicketLog } from '../services/logService.js';
import { getTicketConfig } from '../config/ticketConfig.js';

export async function testTicketLogs(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ Apenas administradores podem testar os logs.', flags: MessageFlags.Ephemeral });
  }
  const cfg = getTicketConfig(interaction.guildId) || {};
  const result = await sendTicketLog(interaction.client, interaction.guildId, cfg, 'config_changed', {
    userId: interaction.user.id,
    details: 'Teste manual do sistema de logs avançados.'
  });
  return interaction.reply({
    content: result ? '✅ Log de teste enviado.' : '❌ Canal de logs não configurado ou inacessível.',
    flags: MessageFlags.Ephemeral
  });
}

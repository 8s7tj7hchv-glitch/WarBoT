import { EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export async function showNotificationInfo(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ Apenas administradores.', flags: MessageFlags.Ephemeral });
  }

  const embed = new EmbedBuilder()
    .setTitle('🔔 Configurações de notificações')
    .setDescription('A Fase 14 reconhece as opções abaixo no config do servidor.')
    .addFields(
      { name: 'Equipe', value: '`mentionStaffOnOpen` — mencionar cargo ao abrir' },
      { name: 'DM', value: '`dmOnOpen`, `dmOnClaim`, `dmOnClose`' },
      { name: 'Canal', value: '`notificationChannelId`' },
      { name: 'Admin', value: '`adminAlertChannelId`' },
      { name: 'Espera', value: '`waitingAlertMinutes`' }
    );

  return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

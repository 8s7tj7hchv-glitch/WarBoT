import { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { getTicketByChannel, updateTicket, appendTicketHistory } from '../database/ticketStore.js';

function canManage(interaction, ticket) {
  if (interaction.user.id === ticket.ownerId) return true;
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
  return !ticket.staffRoleId || interaction.member?.roles?.cache?.has(ticket.staffRoleId);
}

export async function requestClose(interaction, reason) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Este canal não é um ticket registrado.', flags: MessageFlags.Ephemeral });
  if (!canManage(interaction, ticket)) return interaction.reply({ content: '❌ Sem permissão para fechar.', flags: MessageFlags.Ephemeral });
  if (ticket.status === 'closed') return interaction.reply({ content: '❌ Este ticket já está fechado.', flags: MessageFlags.Ephemeral });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close_confirm').setLabel('Confirmar fechamento').setEmoji('🔒').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ticket_close_cancel').setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
  );

  updateTicket(interaction.guildId, interaction.channelId, {
    pendingClose: { reason, requestedBy: interaction.user.id, requestedAt: new Date().toISOString() }
  });

  return interaction.reply({
    embeds: [new EmbedBuilder()
      .setTitle('🔒 Confirmar fechamento')
      .setDescription(`**Motivo:** ${reason}\n\nConfirme para fechar o ticket.`)
      .setTimestamp()],
    components: [row]
  });
}

export async function confirmClose(interaction) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', flags: MessageFlags.Ephemeral });
  if (!canManage(interaction, ticket)) return interaction.reply({ content: '❌ Sem permissão.', flags: MessageFlags.Ephemeral });

  const reason = ticket.pendingClose?.reason || 'Não informado';
  updateTicket(interaction.guildId, interaction.channelId, {
    status: 'closed',
    closedAt: new Date().toISOString(),
    closedBy: interaction.user.id,
    closeReason: reason,
    pendingClose: null
  });
  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'closed', userId: interaction.user.id, reason
  });

  await interaction.channel.permissionOverwrites.edit(ticket.ownerId, {
    SendMessages: false,
    ViewChannel: true,
    ReadMessageHistory: true
  }).catch(() => null);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_reopen').setLabel('Reabrir').setEmoji('🔓').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('ticket_delete').setLabel('Excluir').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );

  await interaction.update({ components: [] }).catch(() => null);
  return interaction.channel.send({
    embeds: [new EmbedBuilder()
      .setTitle('🔒 Ticket fechado')
      .setDescription(`**Motivo:** ${reason}\n**Fechado por:** ${interaction.user}`)
      .setTimestamp()],
    components: [row]
  });
}

export async function cancelClose(interaction) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', flags: MessageFlags.Ephemeral });
  updateTicket(interaction.guildId, interaction.channelId, { pendingClose: null });
  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'close_cancelled', userId: interaction.user.id
  });
  return interaction.update({ content: '✅ Fechamento cancelado.', embeds: [], components: [] });
}

export async function reopenTicket(interaction) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', flags: MessageFlags.Ephemeral });
  if (!canManage(interaction, ticket)) return interaction.reply({ content: '❌ Sem permissão.', flags: MessageFlags.Ephemeral });
  if (ticket.status !== 'closed') return interaction.reply({ content: '❌ O ticket já está aberto.', flags: MessageFlags.Ephemeral });

  updateTicket(interaction.guildId, interaction.channelId, {
    status: 'open', reopenedAt: new Date().toISOString(), closedAt: null, closedBy: null
  });
  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'reopened', userId: interaction.user.id
  });

  await interaction.channel.permissionOverwrites.edit(ticket.ownerId, {
    ViewChannel: true, SendMessages: true, ReadMessageHistory: true
  }).catch(() => null);

  return interaction.reply({
    embeds: [new EmbedBuilder()
      .setTitle('🔓 Ticket reaberto')
      .setDescription(`Reaberto por ${interaction.user}.`)
      .setTimestamp()]
  });
}

export async function scheduleDelete(interaction, delaySeconds = 5) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', flags: MessageFlags.Ephemeral });
  if (!canManage(interaction, ticket)) return interaction.reply({ content: '❌ Sem permissão.', flags: MessageFlags.Ephemeral });
  if (ticket.status !== 'closed') return interaction.reply({ content: '❌ Feche o ticket antes de excluir.', flags: MessageFlags.Ephemeral });

  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'delete_scheduled', userId: interaction.user.id, delaySeconds
  });
  updateTicket(interaction.guildId, interaction.channelId, {
    status: 'deleting', deleteRequestedBy: interaction.user.id
  });

  await interaction.reply(`🗑️ Este ticket será excluído em **${delaySeconds} segundos**.`);
  setTimeout(async () => {
    await interaction.channel.delete(`Ticket #${ticket.number} excluído por ${interaction.user.tag}`).catch(() => null);
  }, delaySeconds * 1000);
}

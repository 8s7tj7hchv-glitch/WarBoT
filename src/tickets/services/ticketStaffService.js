import { PermissionFlagsBits, MessageFlags } from 'discord.js';
import { getTicketByChannel, updateTicket, appendTicketHistory } from '../database/ticketStore.js';

function isStaff(interaction, ticket) {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
  const roleIds = interaction.member?.roles?.cache?.map(r => r.id) ?? [];
  return !ticket.staffRoleId || roleIds.includes(ticket.staffRoleId);
}

export async function claimTicket(interaction) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Este canal não está registrado como ticket.', flags: MessageFlags.Ephemeral });
  if (!isStaff(interaction, ticket)) return interaction.reply({ content: '❌ Você não possui permissão para assumir este ticket.', flags: MessageFlags.Ephemeral });
  if (ticket.claimedBy && ticket.claimedBy !== interaction.user.id) {
    return interaction.reply({ content: `❌ Este ticket já está sendo atendido por <@${ticket.claimedBy}>.`, flags: MessageFlags.Ephemeral });
  }

  updateTicket(interaction.guildId, interaction.channelId, { claimedBy: interaction.user.id });
  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'claim', userId: interaction.user.id
  });

  return interaction.reply({ content: `🙋 Ticket assumido por ${interaction.user}.` });
}

export async function releaseTicket(interaction) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', flags: MessageFlags.Ephemeral });
  if (!isStaff(interaction, ticket)) return interaction.reply({ content: '❌ Sem permissão.', flags: MessageFlags.Ephemeral });

  updateTicket(interaction.guildId, interaction.channelId, { claimedBy: null });
  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'release', userId: interaction.user.id
  });

  return interaction.reply({ content: `👐 Ticket liberado por ${interaction.user}.` });
}

export async function transferTicket(interaction, targetUserId) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', flags: MessageFlags.Ephemeral });
  if (!isStaff(interaction, ticket)) return interaction.reply({ content: '❌ Sem permissão.', flags: MessageFlags.Ephemeral });

  updateTicket(interaction.guildId, interaction.channelId, { claimedBy: targetUserId });
  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'transfer', userId: interaction.user.id, targetUserId
  });

  return interaction.reply({ content: `🔄 Atendimento transferido para <@${targetUserId}>.` });
}

export async function addUserToTicket(interaction, userId) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', flags: MessageFlags.Ephemeral });
  if (!isStaff(interaction, ticket)) return interaction.reply({ content: '❌ Sem permissão.', flags: MessageFlags.Ephemeral });

  await interaction.channel.permissionOverwrites.edit(userId, {
    ViewChannel: true, SendMessages: true, ReadMessageHistory: true,
    AttachFiles: true, EmbedLinks: true
  });

  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'add_user', userId: interaction.user.id, targetUserId: userId
  });

  return interaction.reply({ content: `➕ <@${userId}> foi adicionado ao ticket.` });
}

export async function removeUserFromTicket(interaction, userId) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', flags: MessageFlags.Ephemeral });
  if (!isStaff(interaction, ticket)) return interaction.reply({ content: '❌ Sem permissão.', flags: MessageFlags.Ephemeral });
  if (userId === ticket.ownerId) {
    return interaction.reply({ content: '❌ O dono do ticket não pode ser removido.', flags: MessageFlags.Ephemeral });
  }

  await interaction.channel.permissionOverwrites.delete(userId).catch(() => null);

  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'remove_user', userId: interaction.user.id, targetUserId: userId
  });

  return interaction.reply({ content: `➖ <@${userId}> foi removido do ticket.` });
}

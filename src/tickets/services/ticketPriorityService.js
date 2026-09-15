import { EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { getTicketByChannel, updateTicket, appendTicketHistory } from '../database/ticketStore.js';

export const PRIORITIES = {
  low:    { label: 'Baixa',   emoji: '🟢', prefix: 'baixa' },
  normal: { label: 'Normal',  emoji: '🟡', prefix: 'normal' },
  high:   { label: 'Alta',    emoji: '🟠', prefix: 'alta' },
  urgent: { label: 'Urgente', emoji: '🔴', prefix: 'urgente' }
};

function canManage(interaction, ticket) {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
  const roles = interaction.member?.roles?.cache;
  return !ticket.staffRoleId || roles?.has(ticket.staffRoleId);
}

function clean(value='ticket') {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0, 45) || 'ticket';
}

export async function setTicketPriority(interaction, priorityKey) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) {
    return interaction.reply({ content: '❌ Este canal não está registrado como ticket.', flags: MessageFlags.Ephemeral });
  }
  if (!canManage(interaction, ticket)) {
    return interaction.reply({ content: '❌ Você não possui permissão para alterar a prioridade.', flags: MessageFlags.Ephemeral });
  }

  const priority = PRIORITIES[priorityKey];
  if (!priority) {
    return interaction.reply({ content: '❌ Prioridade inválida.', flags: MessageFlags.Ephemeral });
  }

  const previous = ticket.priority || 'normal';
  updateTicket(interaction.guildId, interaction.channelId, { priority: priorityKey });
  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'priority_change',
    userId: interaction.user.id,
    from: previous,
    to: priorityKey
  });

  const base = clean(ticket.categoryName || 'ticket');
  const number = String(ticket.number || '').padStart(4, '0');
  await interaction.channel.setName(`${priority.prefix}-${base}-${number}`.slice(0, 100)).catch(() => null);

  const embed = new EmbedBuilder()
    .setTitle(`${priority.emoji} Prioridade alterada`)
    .setDescription(`O ticket agora está com prioridade **${priority.label}**.`)
    .addFields(
      { name: 'Alterado por', value: `${interaction.user}`, inline: true },
      { name: 'Anterior', value: `${PRIORITIES[previous]?.emoji || '🟡'} ${PRIORITIES[previous]?.label || 'Normal'}`, inline: true }
    )
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
}

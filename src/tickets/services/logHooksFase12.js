import { sendTicketLog } from './logService.js';

// Use estas funções nos services das fases anteriores logo após a ação ser concluída.

export async function logCreated(client, guildId, cfg, ticket) {
  return sendTicketLog(client, guildId, cfg, 'created', {
    ticketNumber: ticket.number, channelId: ticket.channelId,
    ownerId: ticket.ownerId, categoryName: ticket.categoryName
  });
}
export async function logClaim(client, guildId, cfg, ticket, userId) {
  return sendTicketLog(client, guildId, cfg, 'claim', {
    ticketNumber: ticket.number, channelId: ticket.channelId, userId
  });
}
export async function logTransfer(client, guildId, cfg, ticket, userId, targetUserId) {
  return sendTicketLog(client, guildId, cfg, 'transfer', {
    ticketNumber: ticket.number, channelId: ticket.channelId, userId, targetUserId
  });
}
export async function logPriority(client, guildId, cfg, ticket, userId, priority) {
  return sendTicketLog(client, guildId, cfg, 'priority_change', {
    ticketNumber: ticket.number, channelId: ticket.channelId, userId, priority
  });
}
export async function logClosed(client, guildId, cfg, ticket, userId, reason) {
  return sendTicketLog(client, guildId, cfg, 'closed', {
    ticketNumber: ticket.number, channelId: ticket.channelId, userId, reason
  });
}

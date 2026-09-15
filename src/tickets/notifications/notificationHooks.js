import {
  notifyTicketCreated, notifyClaimed, notifyClosed, notifyAdmin
} from '../services/notificationService.js';

export async function onTicketCreated(interaction, cfg, ticket, channel) {
  return notifyTicketCreated(interaction.client, interaction.guild, cfg, ticket, channel);
}
export async function onTicketClaimed(interaction, cfg, ticket) {
  return notifyClaimed(interaction.client, interaction.guild, cfg, ticket, interaction.user);
}
export async function onTicketClosed(interaction, cfg, ticket, reason) {
  return notifyClosed(interaction.client, interaction.guild, cfg, ticket, interaction.user, reason);
}
export async function onTicketAdminAlert(interaction, cfg, title, description) {
  return notifyAdmin(interaction.client, interaction.guild, cfg, title, description);
}

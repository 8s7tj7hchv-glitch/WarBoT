import { showNotificationInfo } from './notificationConfigInfo.js';

export async function routeTicketFase14(interaction) {
  if (interaction.isButton() && interaction.customId === 'ticket_notification_info') {
    await showNotificationInfo(interaction);
    return true;
  }
  return false;
}

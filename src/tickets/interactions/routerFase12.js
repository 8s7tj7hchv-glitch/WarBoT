import { testTicketLogs } from './logTestPanel.js';

export async function routeTicketFase12(interaction) {
  if (interaction.isButton() && interaction.customId === 'ticket_logs_test') {
    await testTicketLogs(interaction);
    return true;
  }
  return false;
}

import { setTicketPriority } from '../services/ticketPriorityService.js';

export async function routeTicketFase8(interaction) {
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_priority') {
    await setTicketPriority(interaction, interaction.values[0]);
    return true;
  }
  return false;
}

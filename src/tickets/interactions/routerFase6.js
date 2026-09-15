import { handleOpenTicket, handleTicketForm } from './openTicket.js';

export async function routeTicketFase6(interaction) {
  if (interaction.isButton() && interaction.customId.startsWith('ticket_open:')) {
    const categoryKey = interaction.customId.split(':')[1];
    await handleOpenTicket(interaction, categoryKey);
    return true;
  }
  if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_form:')) {
    const categoryKey = interaction.customId.split(':')[1];
    await handleTicketForm(interaction, categoryKey);
    return true;
  }
  return false;
}

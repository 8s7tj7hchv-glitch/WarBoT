import { closeReasonModal } from './closePanel.js';
import {
  requestClose, confirmClose, cancelClose,
  reopenTicket, scheduleDelete
} from '../services/ticketCloseService.js';

export async function routeTicketFase9(interaction) {
  if (interaction.isButton()) {
    if (interaction.customId === 'ticket_close') {
      await interaction.showModal(closeReasonModal()); return true;
    }
    if (interaction.customId === 'ticket_close_confirm') {
      await confirmClose(interaction); return true;
    }
    if (interaction.customId === 'ticket_close_cancel') {
      await cancelClose(interaction); return true;
    }
    if (interaction.customId === 'ticket_reopen') {
      await reopenTicket(interaction); return true;
    }
    if (interaction.customId === 'ticket_delete') {
      await scheduleDelete(interaction, 5); return true;
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === 'ticket_close_reason') {
    const reason = interaction.fields.getTextInputValue('reason').trim();
    await requestClose(interaction, reason);
    return true;
  }
  return false;
}

import { MessageFlags } from 'discord.js';
import {
  claimTicket, releaseTicket, transferTicket,
  addUserToTicket, removeUserFromTicket
} from '../services/ticketStaffService.js';
import { transferModal, addUserModal, removeUserModal } from './staffPanel.js';

export async function routeTicketFase7(interaction) {
  if (interaction.isButton()) {
    if (interaction.customId === 'ticket_claim') {
      await claimTicket(interaction); return true;
    }
    if (interaction.customId === 'ticket_release') {
      await releaseTicket(interaction); return true;
    }
    if (interaction.customId === 'ticket_transfer') {
      await interaction.showModal(transferModal()); return true;
    }
    if (interaction.customId === 'ticket_add_user') {
      await interaction.showModal(addUserModal()); return true;
    }
    if (interaction.customId === 'ticket_remove_user') {
      await interaction.showModal(removeUserModal()); return true;
    }
  }

  if (interaction.isModalSubmit()) {
    const userId = interaction.fields.getTextInputValue('userId').trim();

    if (!/^\d{17,20}$/.test(userId)) {
      await interaction.reply({ content: '❌ ID de usuário inválido.', flags: MessageFlags.Ephemeral });
      return true;
    }

    if (interaction.customId === 'ticket_transfer_modal') {
      await transferTicket(interaction, userId); return true;
    }
    if (interaction.customId === 'ticket_add_user_modal') {
      await addUserToTicket(interaction, userId); return true;
    }
    if (interaction.customId === 'ticket_remove_user_modal') {
      await removeUserFromTicket(interaction, userId); return true;
    }
  }

  return false;
}

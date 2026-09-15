import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder,
  TextInputBuilder, TextInputStyle
} from 'discord.js';
import { buildPriorityRow } from './priorityPanel.js';

export function buildStaffControls(priority = 'normal') {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_claim').setLabel('Assumir').setEmoji('🙋').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_release').setLabel('Liberar').setEmoji('👐').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ticket_transfer').setLabel('Transferir').setEmoji('🔄').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ticket_add_user').setLabel('Adicionar').setEmoji('➕').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('ticket_remove_user').setLabel('Remover').setEmoji('➖').setStyle(ButtonStyle.Secondary)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setEmoji('📄').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ticket_close').setLabel('Fechar').setEmoji('🔒').setStyle(ButtonStyle.Danger)
    ),
    buildPriorityRow(priority)
  ];
}

function oneFieldModal(id, title, label, placeholder) {
  return new ModalBuilder().setCustomId(id).setTitle(title).addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('userId').setLabel(label).setPlaceholder(placeholder)
        .setStyle(TextInputStyle.Short).setRequired(true)
    )
  );
}
export function transferModal() {
  return oneFieldModal('ticket_transfer_modal', 'Transferir atendimento', 'ID do novo atendente', '123456789012345678');
}
export function addUserModal() {
  return oneFieldModal('ticket_add_user_modal', 'Adicionar usuário', 'ID do usuário', '123456789012345678');
}
export function removeUserModal() {
  return oneFieldModal('ticket_remove_user_modal', 'Remover usuário', 'ID do usuário', '123456789012345678');
}

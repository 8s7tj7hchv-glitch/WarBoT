import {
  ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder
} from 'discord.js';

export function closeReasonModal() {
  return new ModalBuilder()
    .setCustomId('ticket_close_reason')
    .setTitle('Fechar ticket')
    .addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Motivo do fechamento')
        .setPlaceholder('Informe o motivo...')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(500)
    ));
}

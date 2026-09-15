import { MessageFlags } from 'discord.js';
import { ratingCommentModal, finishRating } from '../services/ratingService.js';
import { getTicketConfig } from '../config/ticketConfig.js';
import { getTicketByNumber } from './ticketLookupFase11.js';

export async function routeTicketFase11(interaction) {
  if (interaction.isButton() && interaction.customId.startsWith('ticket_rate:')) {
    const [, number, stars] = interaction.customId.split(':');
    await interaction.showModal(ratingCommentModal(number, stars));
    return true;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_rate_comment:')) {
    const [, number, stars] = interaction.customId.split(':');
    const ticket = getTicketByNumber(interaction.guildId, Number(number));
    if (!ticket) {
      await interaction.reply({ content: '❌ Ticket não encontrado para avaliação.', flags: MessageFlags.Ephemeral });
      return true;
    }
    const comment = interaction.fields.getTextInputValue('comment').trim();
    const cfg = getTicketConfig(interaction.guildId) || {};
    await finishRating(interaction, ticket, Number(stars), comment, cfg);
    return true;
  }
  return false;
}

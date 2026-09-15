import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } from 'discord.js';
import { saveRating, getStaffAverage, getGuildAverage } from '../database/ratingStore.js';
import { appendTicketHistory } from '../database/ticketStore.js';

export function buildRatingButtons(ticketNumber) {
  return new ActionRowBuilder().addComponents(
    ...[1,2,3,4,5].map(stars =>
      new ButtonBuilder()
        .setCustomId(`ticket_rate:${ticketNumber}:${stars}`)
        .setLabel(String(stars))
        .setEmoji('⭐')
        .setStyle(ButtonStyle.Secondary)
    )
  );
}

export async function sendRatingRequest(guild, user, ticket) {
  const embed = new EmbedBuilder()
    .setTitle(`⭐ Avalie o Ticket #${ticket.number}`)
    .setDescription(
      `Como foi seu atendimento em **${guild.name}**?\n` +
      `Selecione de **1 a 5 estrelas** abaixo.${ticket.claimedBy ? `\nAtendente: <@${ticket.claimedBy}>` : ''}`
    )
    .setTimestamp();

  return user.send({ embeds: [embed], components: [buildRatingButtons(ticket.number)] }).catch(() => null);
}

export function ratingCommentModal(ticketNumber, stars) {
  return new ModalBuilder()
    .setCustomId(`ticket_rate_comment:${ticketNumber}:${stars}`)
    .setTitle(`Avaliação — ${stars} estrela(s)`)
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('comment')
          .setLabel('Comentário sobre o atendimento')
          .setPlaceholder('Conte como foi sua experiência...')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
          .setMaxLength(1000)
      )
    );
}

export async function finishRating(interaction, ticket, stars, comment, cfg = {}) {
  if (interaction.user.id !== ticket.ownerId) {
    return interaction.reply({ content: '❌ Somente o dono deste ticket pode avaliá-lo.', flags: MessageFlags.Ephemeral });
  }

  const rating = {
    ticketNumber: ticket.number,
    ownerId: ticket.ownerId,
    staffId: ticket.claimedBy || null,
    stars: Number(stars),
    comment: comment || '',
    createdAt: new Date().toISOString()
  };
  saveRating(interaction.guildId || ticket.guildId, rating);

  if (ticket.channelId && interaction.guildId) {
    appendTicketHistory(interaction.guildId, ticket.channelId, {
      action: 'rated', userId: interaction.user.id, stars: Number(stars)
    });
  }

  const guildId = interaction.guildId || ticket.guildId;
  const staffStats = ticket.claimedBy ? getStaffAverage(guildId, ticket.claimedBy) : null;
  const guildStats = getGuildAverage(guildId);

  const embed = new EmbedBuilder()
    .setTitle('⭐ Nova avaliação de atendimento')
    .addFields(
      { name: 'Ticket', value: `#${ticket.number}`, inline: true },
      { name: 'Nota', value: `${'⭐'.repeat(Number(stars))} (${stars}/5)`, inline: true },
      { name: 'Atendente', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Não definido', inline: true },
      { name: 'Comentário', value: comment || '*Sem comentário*' },
      ...(staffStats ? [{ name: 'Média do atendente', value: `${staffStats.average.toFixed(2)}/5 • ${staffStats.total} avaliação(ões)`, inline: true }] : []),
      { name: 'Média geral', value: `${guildStats.average.toFixed(2)}/5 • ${guildStats.total} avaliação(ões)`, inline: true }
    )
    .setTimestamp();

  const logChannelId = cfg.ratingLogChannelId || cfg.logChannelId || cfg.logsChannelId;
  if (interaction.guild && logChannelId) {
    const log = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
    if (log?.isTextBased()) await log.send({ embeds: [embed] }).catch(() => null);
  }

  return interaction.reply({ content: `✅ Obrigado! Sua avaliação de **${stars}/5** foi registrada.`, flags: MessageFlags.Ephemeral });
}

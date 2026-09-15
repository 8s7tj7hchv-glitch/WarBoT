import { EmbedBuilder } from 'discord.js';
import { getTicketByChannel, updateTicket } from '../database/ticketStore.js';

export async function checkTicketWaiting(channel, cfg = {}) {
  const ticket = getTicketByChannel(channel.guild.id, channel.id);
  if (!ticket || ticket.status !== 'open' || ticket.claimedBy) return false;

  const minutes = Math.max(1, Number(cfg.waitingAlertMinutes ?? 30));
  const created = new Date(ticket.createdAt).getTime();
  if (!created || Date.now() - created < minutes * 60_000) return false;
  if (ticket.waitingAlertSent) return false;

  const roleId = ticket.staffRoleId || cfg.staffRoleId || cfg.supportRoleId;
  await channel.send({
    content: roleId ? `<@&${roleId}>` : undefined,
    embeds: [new EmbedBuilder()
      .setTitle('⏰ Ticket aguardando atendimento')
      .setDescription(`O ticket **#${ticket.number}** ainda não foi assumido.`)
      .setTimestamp()],
    allowedMentions: roleId ? { roles: [roleId] } : { parse: [] }
  }).catch(() => null);

  updateTicket(channel.guild.id, channel.id, {
    waitingAlertSent: true,
    waitingAlertAt: new Date().toISOString()
  });
  return true;
}

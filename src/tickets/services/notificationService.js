import { EmbedBuilder } from 'discord.js';

export async function notifyTicketCreated(client, guild, cfg, ticket, channel) {
  const roleId = ticket.staffRoleId || cfg.staffRoleId || cfg.supportRoleId;
  const notificationChannelId = cfg.notificationChannelId || cfg.logChannelId || cfg.logsChannelId;

  if (notificationChannelId) {
    const target = await guild.channels.fetch(notificationChannelId).catch(() => null);
    if (target?.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle('🔔 Novo ticket aguardando atendimento')
        .addFields(
          { name: 'Ticket', value: `#${ticket.number}`, inline: true },
          { name: 'Canal', value: `${channel}`, inline: true },
          { name: 'Usuário', value: `<@${ticket.ownerId}>`, inline: true },
          { name: 'Categoria', value: ticket.categoryName || ticket.categoryKey || '—', inline: true }
        )
        .setTimestamp();

      await target.send({
        content: roleId && cfg.mentionStaffOnOpen !== false ? `<@&${roleId}>` : undefined,
        embeds: [embed],
        allowedMentions: roleId ? { roles: [roleId] } : { parse: [] }
      }).catch(() => null);
    }
  }

  if (cfg.dmOnOpen !== false) {
    const user = await client.users.fetch(ticket.ownerId).catch(() => null);
    if (user) {
      await user.send(
        `🎫 Seu ticket **#${ticket.number}** foi aberto em **${guild.name}**.\nCanal: ${channel}`
      ).catch(() => null);
    }
  }
}

export async function notifyClaimed(client, guild, cfg, ticket, staffUser) {
  if (cfg.dmOnClaim === false) return;
  const owner = await client.users.fetch(ticket.ownerId).catch(() => null);
  if (owner) {
    await owner.send(
      `🙋 Seu ticket **#${ticket.number}** em **${guild.name}** foi assumido por **${staffUser.tag}**.`
    ).catch(() => null);
  }
}

export async function notifyClosed(client, guild, cfg, ticket, closedBy, reason) {
  if (cfg.dmOnClose === false) return;
  const owner = await client.users.fetch(ticket.ownerId).catch(() => null);
  if (owner) {
    await owner.send(
      `🔒 Seu ticket **#${ticket.number}** em **${guild.name}** foi fechado.\n` +
      `Por: **${closedBy.tag}**\nMotivo: **${reason || 'Não informado'}**`
    ).catch(() => null);
  }
}

export async function notifyAdmin(client, guild, cfg, title, description) {
  const channelId = cfg.adminAlertChannelId || cfg.notificationChannelId || cfg.logChannelId;
  if (!channelId) return null;

  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased()) return null;

  return channel.send({
    embeds: [new EmbedBuilder()
      .setTitle(`⚠️ ${title}`)
      .setDescription(description)
      .setTimestamp()]
  }).catch(() => null);
}

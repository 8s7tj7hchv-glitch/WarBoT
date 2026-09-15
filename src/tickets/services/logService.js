import { EmbedBuilder } from 'discord.js';

const ACTIONS = {
  created: ['🎫', 'Ticket criado'],
  claim: ['🙋', 'Ticket assumido'],
  release: ['👐', 'Ticket liberado'],
  transfer: ['🔄', 'Atendimento transferido'],
  add_user: ['➕', 'Usuário adicionado'],
  remove_user: ['➖', 'Usuário removido'],
  priority_change: ['🚦', 'Prioridade alterada'],
  closed: ['🔒', 'Ticket fechado'],
  close_cancelled: ['↩️', 'Fechamento cancelado'],
  reopened: ['🔓', 'Ticket reaberto'],
  delete_scheduled: ['🗑️', 'Exclusão agendada'],
  transcript_generated: ['📄', 'Transcript gerado'],
  rated: ['⭐', 'Ticket avaliado'],
  config_changed: ['⚙️', 'Configuração alterada'],
  category_created: ['📂', 'Categoria criada'],
  category_updated: ['✏️', 'Categoria alterada'],
  category_deleted: ['🗑️', 'Categoria excluída']
};

export async function sendTicketLog(client, guildId, cfg, action, data = {}) {
  const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
  if (!guild) return null;

  const channelId = cfg?.logChannelId || cfg?.logsChannelId;
  if (!channelId) return null;

  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased()) return null;

  const [emoji, title] = ACTIONS[action] || ['📝', action];
  const fields = [];

  if (data.ticketNumber != null) fields.push({ name: 'Ticket', value: `#${data.ticketNumber}`, inline: true });
  if (data.channelId) fields.push({ name: 'Canal', value: `<#${data.channelId}>`, inline: true });
  if (data.userId) fields.push({ name: 'Responsável pela ação', value: `<@${data.userId}>`, inline: true });
  if (data.ownerId) fields.push({ name: 'Dono do ticket', value: `<@${data.ownerId}>`, inline: true });
  if (data.targetUserId) fields.push({ name: 'Usuário alvo', value: `<@${data.targetUserId}>`, inline: true });
  if (data.staffId) fields.push({ name: 'Atendente', value: `<@${data.staffId}>`, inline: true });
  if (data.categoryName) fields.push({ name: 'Categoria', value: String(data.categoryName).slice(0,1024), inline: true });
  if (data.priority) fields.push({ name: 'Prioridade', value: String(data.priority), inline: true });
  if (data.reason) fields.push({ name: 'Motivo', value: String(data.reason).slice(0,1024) });
  if (data.details) fields.push({ name: 'Detalhes', value: String(data.details).slice(0,1024) });

  const embed = new EmbedBuilder()
    .setTitle(`${emoji} ${title}`)
    .setTimestamp();

  if (fields.length) embed.addFields(fields);
  return channel.send({ embeds: [embed] }).catch(() => null);
}

export async function logConfigChange(interaction, cfg, key, oldValue, newValue) {
  return sendTicketLog(interaction.client, interaction.guildId, cfg, 'config_changed', {
    userId: interaction.user.id,
    details: `**Campo:** ${key}\n**Antes:** ${oldValue ?? '—'}\n**Depois:** ${newValue ?? '—'}`
  });
}

import { PermissionFlagsBits } from 'discord.js';

const REQUIRED = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageMessages,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.AttachFiles,
  PermissionFlagsBits.EmbedLinks
];

export function validateTicketPermissions(guild) {
  const me = guild.members.me;
  if (!me) return { ok: false, missing: ['Bot não encontrado como membro do servidor'] };
  const missing = REQUIRED.filter(p => !me.permissions.has(p)).map(String);
  return { ok: missing.length === 0, missing };
}

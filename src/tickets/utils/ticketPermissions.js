import { PermissionFlagsBits } from 'discord.js';

export function canManageTickets(member, config) {
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (config.adminRoleId && member.roles.cache.has(config.adminRoleId)) return true;
  return false;
}

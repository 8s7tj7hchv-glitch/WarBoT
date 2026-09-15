import { PermissionFlagsBits } from 'discord.js';
import {
  isBlacklisted, getCooldown, setCooldown,
  getBlockedUntil, setBlockedUntil, addAudit
} from '../database/securityStore.js';

const bursts = new Map();

function burstKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

export function isTicketStaff(interaction, ticket = null, cfg = {}) {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
  const roleId = ticket?.staffRoleId || cfg.staffRoleId || cfg.supportRoleId;
  return Boolean(roleId && interaction.member?.roles?.cache?.has(roleId));
}

export function checkInteractionBurst(guildId, userId, max = 8, windowMs = 10_000) {
  const key = burstKey(guildId, userId);
  const now = Date.now();
  const rows = (bursts.get(key) || []).filter(t => now - t < windowMs);
  rows.push(now);
  bursts.set(key, rows);
  return rows.length <= max;
}

export function guardTicketOpen(interaction, cfg = {}) {
  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const now = Date.now();

  if (isBlacklisted(guildId, userId)) {
    addAudit(guildId, { type: 'open_denied_blacklist', userId });
    return { ok: false, message: '❌ Você está bloqueado de abrir tickets neste servidor.' };
  }

  const blockedUntil = getBlockedUntil(guildId, userId);
  if (blockedUntil > now) {
    const seconds = Math.ceil((blockedUntil - now) / 1000);
    addAudit(guildId, { type: 'open_denied_tempblock', userId, seconds });
    return { ok: false, message: `❌ Abertura temporariamente bloqueada. Tente novamente em ${seconds}s.` };
  }

  if (!checkInteractionBurst(guildId, userId)) {
    setBlockedUntil(guildId, userId, now + 60_000);
    addAudit(guildId, { type: 'anti_spam_triggered', userId });
    return { ok: false, message: '🛡️ Muitas interações em pouco tempo. Aguarde 60 segundos.' };
  }

  const cooldownSeconds = Math.max(0, Number(cfg.cooldown ?? cfg.ticketCooldown ?? 30));
  const last = getCooldown(guildId, userId);
  const remaining = Math.ceil((last + cooldownSeconds * 1000 - now) / 1000);
  if (remaining > 0) {
    addAudit(guildId, { type: 'open_denied_cooldown', userId, remaining });
    return { ok: false, message: `⏳ Aguarde ${remaining}s antes de abrir outro ticket.` };
  }

  setCooldown(guildId, userId, now);
  addAudit(guildId, { type: 'open_allowed', userId });
  return { ok: true };
}

export function auditAction(guildId, type, userId, extra = {}) {
  addAudit(guildId, { type, userId, ...extra });
}

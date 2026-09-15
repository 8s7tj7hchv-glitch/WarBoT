import fs from 'node:fs';
import path from 'node:path';
import { validateTicketPermissions } from '../utils/permissionValidator.js';

export function ticketHealth(guild, cfg = {}) {
  const permissions = validateTicketPermissions(guild);
  const issues = [];
  if (!cfg.ticketCategoryId) issues.push('Categoria padrão de tickets não configurada.');
  if (!cfg.supportRoleId && !cfg.staffRoleId) issues.push('Cargo de suporte não configurado.');
  if (!cfg.logChannelId && !cfg.logsChannelId) issues.push('Canal de logs não configurado.');
  if (!permissions.ok) issues.push(`Permissões ausentes no bot: ${permissions.missing.join(', ')}`);
  const dataDir = path.resolve('data','tickets');
  try { fs.mkdirSync(dataDir,{recursive:true}); fs.accessSync(dataDir, fs.constants.W_OK); }
  catch { issues.push('Diretório data/tickets sem permissão de escrita.'); }
  return { ok: issues.length === 0, issues };
}

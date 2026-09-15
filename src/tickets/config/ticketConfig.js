import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'data', 'tickets');
const configFile = path.join(dataDir, 'guild-config.json');

const DEFAULT_CONFIG = Object.freeze({
  enabled: false,
  panelChannelId: null,
  ticketCategoryId: null,
  logChannelId: null,
  supportRoleId: null,
  adminRoleId: null,
  maxOpenTickets: 1,
  cooldownSeconds: 30,

  // FASE 3 — Personalização do painel
  panelTitle: '🎫 Central de Atendimento',
  panelDescription: 'Precisa de ajuda? Clique no botão abaixo para abrir um ticket.',
  panelColor: '#5865F2',
  panelThumbnail: null,
  panelImage: null,
  panelFooter: 'Sistema de Tickets',
  openButtonLabel: 'Abrir Ticket',
  openButtonEmoji: '🎫',
  openButtonStyle: 'Primary',

  // FASE 4/5 — Categorias e formulários personalizados
  // Cada ticketType pode possuir `formQuestions` (máximo 5 por limitação dos modais do Discord).
  ticketTypes: [],
});

function ensureStorage() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, '{}', 'utf8');
}

function readAll() {
  ensureStorage();
  try {
    const raw = fs.readFileSync(configFile, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('❌ Erro ao ler configuração de tickets:', error);
    return {};
  }
}

function writeAll(data) {
  ensureStorage();
  const temp = `${configFile}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(temp, configFile);
}

export function getTicketConfig(guildId) {
  const all = readAll();
  return { ...DEFAULT_CONFIG, ...(all[guildId] ?? {}) };
}

export function updateTicketConfig(guildId, patch) {
  const all = readAll();
  all[guildId] = { ...DEFAULT_CONFIG, ...(all[guildId] ?? {}), ...patch };
  writeAll(all);
  return all[guildId];
}

export function resetTicketConfig(guildId) {
  const all = readAll();
  all[guildId] = { ...DEFAULT_CONFIG };
  writeAll(all);
  return all[guildId];
}

export function ticketConfigStatus(config) {
  const required = ['panelChannelId', 'ticketCategoryId', 'logChannelId', 'supportRoleId'];
  const missing = required.filter((key) => !config[key]);
  return { ready: missing.length === 0, missing };
}

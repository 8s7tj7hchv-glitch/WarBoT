import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data', 'tickets');
const FILE = path.join(DATA_DIR, 'tickets.json');

function ensure() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ guilds: {} }, null, 2));
}
function read() {
  ensure();
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return { guilds: {} }; }
}
function write(data) {
  ensure();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}
function ensureGuild(data, guildId) {
  return data.guilds[guildId] ??= { sequence: 0, tickets: {} };
}

export function nextTicketNumber(guildId) {
  const data = read();
  const g = ensureGuild(data, guildId);
  g.sequence += 1;
  write(data);
  return g.sequence;
}
export function createTicketRecord(guildId, record) {
  const data = read();
  const g = ensureGuild(data, guildId);
  g.tickets[record.channelId] = { history: [], ...record };
  write(data);
  return g.tickets[record.channelId];
}
export function getTicketByChannel(guildId, channelId) {
  return read().guilds[guildId]?.tickets?.[channelId] ?? null;
}
export function updateTicket(guildId, channelId, patch) {
  const data = read();
  const g = ensureGuild(data, guildId);
  if (!g.tickets[channelId]) return null;
  g.tickets[channelId] = { ...g.tickets[channelId], ...patch };
  write(data);
  return g.tickets[channelId];
}
export function appendTicketHistory(guildId, channelId, entry) {
  const data = read();
  const g = ensureGuild(data, guildId);
  const current = g.tickets[channelId];
  if (!current) return null;
  current.history ??= [];
  current.history.push({ ...entry, at: entry.at || new Date().toISOString() });
  write(data);
  return current;
}
export function getOpenTicketsByUser(guildId, userId, categoryKey = null) {
  const tickets = Object.values(read().guilds[guildId]?.tickets ?? {});
  return tickets.filter(t => t.ownerId === userId && t.status === 'open' &&
    (!categoryKey || t.categoryKey === categoryKey));
}
export function getTicketByNumber(guildId, number) {
  const tickets = Object.values(read().guilds[guildId]?.tickets ?? {});
  return tickets.find(t => Number(t.number) === Number(number)) ?? null;
}

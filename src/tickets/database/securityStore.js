import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('data', 'tickets');
const FILE = path.join(DIR, 'security.json');

function ensure() {
  fs.mkdirSync(DIR, { recursive: true });
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
function guild(data, guildId) {
  return data.guilds[guildId] ??= {
    blacklist: [],
    cooldowns: {},
    blockedUntil: {},
    audit: []
  };
}

export function isBlacklisted(guildId, userId) {
  const data = read();
  return guild(data, guildId).blacklist.includes(userId);
}
export function setBlacklist(guildId, userId, enabled) {
  const data = read();
  const g = guild(data, guildId);
  g.blacklist = g.blacklist.filter(id => id !== userId);
  if (enabled) g.blacklist.push(userId);
  write(data);
}
export function getCooldown(guildId, userId) {
  const data = read();
  return Number(guild(data, guildId).cooldowns[userId] || 0);
}
export function setCooldown(guildId, userId, timestamp) {
  const data = read();
  guild(data, guildId).cooldowns[userId] = timestamp;
  write(data);
}
export function getBlockedUntil(guildId, userId) {
  const data = read();
  return Number(guild(data, guildId).blockedUntil[userId] || 0);
}
export function setBlockedUntil(guildId, userId, timestamp) {
  const data = read();
  guild(data, guildId).blockedUntil[userId] = timestamp;
  write(data);
}
export function addAudit(guildId, entry) {
  const data = read();
  const g = guild(data, guildId);
  g.audit.push({ ...entry, at: new Date().toISOString() });
  if (g.audit.length > 2000) g.audit = g.audit.slice(-2000);
  write(data);
}

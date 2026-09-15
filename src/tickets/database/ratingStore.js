import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('data', 'tickets');
const FILE = path.join(DIR, 'ratings.json');

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

export function saveRating(guildId, rating) {
  const data = read();
  const guild = data.guilds[guildId] ??= { ratings: [] };
  const existing = guild.ratings.findIndex(r => r.ticketNumber === rating.ticketNumber);
  if (existing >= 0) guild.ratings[existing] = rating;
  else guild.ratings.push(rating);
  write(data);
  return rating;
}

export function getGuildRatings(guildId) {
  return read().guilds[guildId]?.ratings ?? [];
}

export function getStaffAverage(guildId, staffId) {
  const rows = getGuildRatings(guildId).filter(r => r.staffId === staffId);
  if (!rows.length) return { average: 0, total: 0 };
  const sum = rows.reduce((n, r) => n + Number(r.stars || 0), 0);
  return { average: sum / rows.length, total: rows.length };
}

export function getGuildAverage(guildId) {
  const rows = getGuildRatings(guildId);
  if (!rows.length) return { average: 0, total: 0 };
  const sum = rows.reduce((n, r) => n + Number(r.stars || 0), 0);
  return { average: sum / rows.length, total: rows.length };
}

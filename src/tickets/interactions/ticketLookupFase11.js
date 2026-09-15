import fs from 'node:fs';
import path from 'node:path';

const FILE = path.resolve('data', 'tickets', 'tickets.json');

export function getTicketByNumber(guildId, number) {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const tickets = Object.values(data.guilds?.[guildId]?.tickets ?? {});
    const found = tickets.find(t => Number(t.number) === Number(number));
    return found ? { ...found, guildId } : null;
  } catch {
    return null;
  }
}

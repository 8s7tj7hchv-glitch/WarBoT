import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MARKET_DATA_DIR } from '../config/settings.js';

const FILE = path.join(MARKET_DATA_DIR, 'guild_markets.json');
const clone = (value) => structuredClone(value);

export class GuildMarketRegistry {
  constructor() {
    JsonManager.ensureFile(FILE, []);
  }

  load() {
    const data = JsonManager.load(FILE, []);
    return Array.isArray(data) ? data : [];
  }

  save(data) {
    JsonManager.save(FILE, data);
  }

  register(guildId, guildName = 'Servidor') {
    const id = String(guildId ?? '').trim();
    if (!id) return null;

    const now = new Date().toISOString();
    const data = this.load();
    const index = data.findIndex((x) => x.guild_id === id);

    if (index >= 0) {
      data[index] = {
        ...data[index],
        guild_name: String(guildName || data[index].guild_name || 'Servidor').slice(0, 100),
        updated_at: now
      };
      this.save(data);
      return clone(data[index]);
    }

    const market = {
      guild_id: id,
      guild_name: String(guildName || 'Servidor').slice(0, 100),
      active: true,
      created_at: now,
      updated_at: now
    };
    data.push(market);
    this.save(data);
    return clone(market);
  }

  get(guildId) {
    const id = String(guildId ?? '');
    return clone(this.load().find((x) => x.guild_id === id) ?? null);
  }

  listActive() {
    return this.load().filter((x) => x.active !== false).map(clone);
  }
}

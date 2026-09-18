import path from 'node:path';
import crypto from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { DATA_DIR } from '../config/settings.js';

const DIR = path.join(DATA_DIR, 'global_profile');
const FILE = path.join(DIR, 'profiles.json');

function now() { return new Date().toISOString(); }
function clean(v) { return String(v ?? '').trim(); }

export class GlobalProfileManager {
  constructor(filePath = FILE) { this.path = filePath; JsonManager.ensureFile(this.path, {}); }
  _all() { const d = JsonManager.load(this.path, {}); return d && !Array.isArray(d) && typeof d === 'object' ? d : {}; }
  _save(d) { JsonManager.save(this.path, d); }
  _newGameId(all) {
    for (let i=0;i<100;i++) {
      const raw = crypto.randomBytes(5).toString('hex').toUpperCase();
      const id = `WB-${raw.slice(0,4)}-${raw.slice(4,8)}`;
      if (!Object.values(all).some(p => p.game_id === id)) return id;
    }
    throw new Error('Não foi possível gerar um Game ID único.');
  }
  getByDiscordId(userId) { return this._all()[clean(userId)] ?? null; }
  getByGameId(gameId) {
    const wanted = clean(gameId).toUpperCase();
    return Object.values(this._all()).find(p => p.game_id === wanted) ?? null;
  }
  touch({ userId, username='', guildId=null, guildName='' }) {
    const all = this._all(); const key = clean(userId); if (!key) throw new Error('Usuário inválido.');
    const t = now();
    const p = all[key] ?? { game_id: this._newGameId(all), discord_user_id:key, username:clean(username), origin_guild_id:guildId?clean(guildId):null, origin_guild_name:clean(guildName), guilds:[], created_at:t };
    p.username = clean(username) || p.username; p.last_seen_at = t;
    if (guildId) {
      const gid=clean(guildId); const old=p.guilds.find(g=>g.guild_id===gid);
      if (old) { old.guild_name=clean(guildName)||old.guild_name; old.last_seen_at=t; }
      else p.guilds.push({guild_id:gid,guild_name:clean(guildName),first_seen_at:t,last_seen_at:t});
      if (!p.origin_guild_id) { p.origin_guild_id=gid; p.origin_guild_name=clean(guildName); }
    }
    all[key]=p; this._save(all); return structuredClone(p);
  }
  list() { return Object.values(this._all()); }
}

import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { NOTIFICATIONS_DATA_DIR } from '../config/settings.js';

const FILE = path.join(NOTIFICATIONS_DATA_DIR, 'guild_channels.json');
const TYPES = new Set(['market', 'trades', 'war', 'world']);
const clone = v => structuredClone(v);

export class GameChannelManager {
  constructor(){ JsonManager.ensureFile(FILE, {}); }
  load(){ const d=JsonManager.load(FILE,{}); return d && typeof d==='object' && !Array.isArray(d) ? d : {}; }
  save(d){ JsonManager.save(FILE,d); }
  normalizeType(type){ const t=String(type??'').toLowerCase(); if(!TYPES.has(t)) throw new Error('Tipo de canal inválido.'); return t; }
  get(guildId){ return clone(this.load()[String(guildId)] ?? {}); }
  getChannelId(guildId,type){ return this.get(guildId)[this.normalizeType(type)] ?? null; }
  set(guildId,type,channelId){ const gid=String(guildId), t=this.normalizeType(type); const all=this.load(); all[gid] ??= {}; all[gid][t]=String(channelId); this.save(all); return this.get(gid); }
  remove(guildId,type){ const gid=String(guildId), t=this.normalizeType(type); const all=this.load(); if(all[gid]) delete all[gid][t]; this.save(all); return this.get(gid); }
  listTypes(){ return [...TYPES]; }
}

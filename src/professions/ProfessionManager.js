import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { PROFESSIONS_DATA_DIR } from '../config/settings.js';
import { PROFESSIONS, professionExists } from './registry.js';
const FILE = path.join(PROFESSIONS_DATA_DIR, 'professions.json');
const clone = (v) => structuredClone(v);
export function buildDefaultProfessions() {
  return Object.fromEntries(Object.keys(PROFESSIONS).map((id) => [id, { level: 1, xp: 0, actions: 0, total_earned: 0, unlocked: true }]));
}
export class ProfessionManager {
  constructor(filePath = FILE) { this.path = filePath; JsonManager.ensureFile(this.path, {}); }
  loadAll() { const d = JsonManager.load(this.path, {}); return d && !Array.isArray(d) && typeof d === 'object' ? d : {}; }
  saveAll(d) { JsonManager.save(this.path, d); }
  create(userId) { const d = this.loadAll(), k = String(userId); if (d[k]) return clone(d[k]); d[k] = buildDefaultProfessions(); this.saveAll(d); return clone(d[k]); }
  getAll(userId) {
    const d = this.loadAll(), k = String(userId); if (!d[k]) return this.create(userId);
    const current = buildDefaultProfessions();
    for (const id of Object.keys(current)) Object.assign(current[id], d[k]?.[id] ?? {});
    return current;
  }
  get(userId, professionId) { if (!professionExists(professionId)) return null; return clone(this.getAll(userId)[professionId]); }
  save(userId, professionId, professionData) { if (!professionExists(professionId)) return false; const d = this.loadAll(), k = String(userId); d[k] ??= buildDefaultProfessions(); d[k][professionId] = clone(professionData); this.saveAll(d); return true; }
  incrementActions(userId, professionId, amount = 1) { const p = this.get(userId, professionId); if (!p) return 0; p.actions = Math.max(0, Math.trunc(Number(p.actions) || 0) + Math.trunc(Number(amount) || 0)); this.save(userId, professionId, p); return p.actions; }
  addEarned(userId, professionId, amount) { const p = this.get(userId, professionId); if (!p) return 0; p.total_earned = Math.max(0, Number(p.total_earned || 0) + Number(amount || 0)); this.save(userId, professionId, p); return p.total_earned; }
}

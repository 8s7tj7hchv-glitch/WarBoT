import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { PROFESSIONS_DATA_DIR } from '../config/settings.js';
const FILE = path.join(PROFESSIONS_DATA_DIR, 'cooldowns.json');
export class ProfessionCooldownManager {
  constructor(filePath = FILE) { this.path = filePath; JsonManager.ensureFile(this.path, {}); }
  load() { return JsonManager.load(this.path, {}); }
  set(userId, professionId, action, seconds) { const d = this.load(), k = String(userId); d[k] ??= {}; d[k][professionId] ??= {}; d[k][professionId][action] = new Date(Date.now() + Math.max(0, Number(seconds) || 0) * 1000).toISOString(); JsonManager.save(this.path, d); }
  remaining(userId, professionId, action) { const raw = this.load()?.[String(userId)]?.[professionId]?.[action]; if (!raw) return 0; const ms = Date.parse(raw) - Date.now(); return Math.max(0, Math.ceil(ms / 1000)); }
  ready(userId, professionId, action) { return this.remaining(userId, professionId, action) <= 0; }
}

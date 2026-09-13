import { JsonManager } from '../core/JsonManager.js';
export class JsonRegistry {
  constructor(filePath) { this.path = filePath; JsonManager.ensureFile(this.path, {}); }
  loadAll() { const d = JsonManager.load(this.path, {}); return d && !Array.isArray(d) && typeof d === 'object' ? d : {}; }
  get(id) { const v = this.loadAll()?.[id]; return v ? { id, ...structuredClone(v) } : null; }
  listAll() { return Object.entries(this.loadAll()).map(([id, v]) => ({ id, ...structuredClone(v) })); }
  availableForLevel(level) { return this.listAll().filter((v) => Number(v.required_level ?? 1) <= Number(level ?? 1)); }
}

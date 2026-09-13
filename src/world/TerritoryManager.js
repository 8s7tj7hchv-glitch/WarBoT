import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { WORLD_DATA_DIR } from '../config/settings.js';
const FILE = path.join(WORLD_DATA_DIR, 'territories.json');
const clone = (v) => structuredClone(v);
export class TerritoryManager {
  constructor() { JsonManager.ensureFile(FILE, []); }
  load() { const d = JsonManager.load(FILE, []); return Array.isArray(d) ? d : []; }
  save(d) { JsonManager.save(FILE, d); }
  list() { return this.load().map(clone); }
  get(id) { return clone(this.load().find((x) => x.id === String(id)) ?? null); }
  byCountry(countryId) { const id = String(countryId); return this.load().filter((x) => x.owner_country_id === id || x.controller_country_id === id).map(clone); }
  neutral() { return this.load().filter((x) => !x.owner_country_id).map(clone); }
  update(id, patch) { const all = this.load(); const i = all.findIndex((x) => x.id === String(id)); if (i < 0) throw new Error('Território não encontrado.'); all[i] = { ...all[i], ...clone(patch), updated_at: new Date().toISOString() }; this.save(all); return clone(all[i]); }
}

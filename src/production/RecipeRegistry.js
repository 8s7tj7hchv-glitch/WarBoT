import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { PRODUCTION_DATA_DIR } from '../config/settings.js';
const RECIPE_FILES = Object.freeze({
  refining: path.join(PRODUCTION_DATA_DIR, 'refining_recipes.json'),
  components: path.join(PRODUCTION_DATA_DIR, 'component_recipes.json'),
  tools: path.join(PRODUCTION_DATA_DIR, 'tool_recipes.json'),
  machinery: path.join(PRODUCTION_DATA_DIR, 'machinery_recipes.json'),
  vehicles: path.join(PRODUCTION_DATA_DIR, 'vehicle_recipes.json'),
  military: path.join(PRODUCTION_DATA_DIR, 'military_recipes.json')
});
const clone = (value) => structuredClone(value);
export class RecipeRegistry {
  constructor() { for (const file of Object.values(RECIPE_FILES)) JsonManager.ensureFile(file, {}); }
  loadCategory(category) { const file = RECIPE_FILES[category]; if (!file) return {}; const data = JsonManager.load(file, {}); return data && !Array.isArray(data) && typeof data === 'object' ? data : {}; }
  loadAll() {
    const recipes = {};
    for (const category of Object.keys(RECIPE_FILES)) {
      for (const [id, raw] of Object.entries(this.loadCategory(category))) recipes[id] = { ...clone(raw), id, category };
    }
    return recipes;
  }
  get(id) { const value = this.loadAll()[String(id ?? '').trim()]; return value ? clone(value) : null; }
  listAll() { return Object.values(this.loadAll()).map(clone); }
  listCategory(category) { return Object.entries(this.loadCategory(category)).map(([id, raw]) => ({ ...clone(raw), id, category })); }
  search(query) { const q = String(query ?? '').toLowerCase(); return this.listAll().filter((r) => r.id.toLowerCase().includes(q) || String(r.name ?? '').toLowerCase().includes(q)); }
}

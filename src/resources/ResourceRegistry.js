import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { RESOURCES_DATA_DIR } from '../config/settings.js';

const RESOURCE_FILES = Object.freeze({
  raw_materials: path.join(RESOURCES_DATA_DIR, 'raw_materials.json'),
  minerals: path.join(RESOURCES_DATA_DIR, 'minerals.json'),
  refined_materials: path.join(RESOURCES_DATA_DIR, 'refined_materials.json'),
  industrial_materials: path.join(RESOURCES_DATA_DIR, 'industrial_materials.json'),
  special_resources: path.join(RESOURCES_DATA_DIR, 'special_resources.json')
});

const clone = (value) => structuredClone(value);

export class ResourceRegistry {
  constructor() {
    for (const file of Object.values(RESOURCE_FILES)) JsonManager.ensureFile(file, {});
  }

  static normalizeId(resourceId) {
    return String(resourceId ?? '').trim().toLowerCase().replace(/[ -]+/g, '_');
  }

  loadCategory(category) {
    const file = RESOURCE_FILES[category];
    if (!file) return {};
    const data = JsonManager.load(file, {});
    return data && !Array.isArray(data) && typeof data === 'object' ? data : {};
  }

  loadAll() {
    const resources = {};
    for (const category of Object.keys(RESOURCE_FILES)) {
      for (const [id, raw] of Object.entries(this.loadCategory(category))) {
        resources[id] = { ...clone(raw), id, category, item_type: 'resource' };
      }
    }
    return resources;
  }

  get(resourceId) {
    const value = this.loadAll()[ResourceRegistry.normalizeId(resourceId)];
    return value ? clone(value) : null;
  }

  exists(resourceId) { return this.get(resourceId) !== null; }

  listCategory(category) {
    return Object.entries(this.loadCategory(category)).map(([id, raw]) => ({
      ...clone(raw), id, category, item_type: 'resource'
    }));
  }

  listAll() { return Object.values(this.loadAll()).map(clone); }

  search(query) {
    const q = String(query ?? '').trim().toLowerCase();
    return this.listAll().filter((item) =>
      String(item.id).toLowerCase().includes(q) || String(item.name ?? '').toLowerCase().includes(q)
    );
  }

  count() { return Object.keys(this.loadAll()).length; }

  countByCategory() {
    return Object.fromEntries(Object.keys(RESOURCE_FILES).map((category) => [category, this.listCategory(category).length]));
  }
}

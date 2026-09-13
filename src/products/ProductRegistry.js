import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { PRODUCTS_DATA_DIR } from '../config/settings.js';

const PRODUCT_FILES = Object.freeze({
  components: path.join(PRODUCTS_DATA_DIR, 'components.json'),
  tools: path.join(PRODUCTS_DATA_DIR, 'tools.json'),
  machinery: path.join(PRODUCTS_DATA_DIR, 'machinery.json'),
  vehicles: path.join(PRODUCTS_DATA_DIR, 'vehicles.json'),
  construction: path.join(PRODUCTS_DATA_DIR, 'construction.json')
});
const clone = (value) => structuredClone(value);

export class ProductRegistry {
  constructor() { for (const file of Object.values(PRODUCT_FILES)) JsonManager.ensureFile(file, {}); }
  static normalizeId(id) { return String(id ?? '').trim().toLowerCase().replace(/[ -]+/g, '_'); }
  loadCategory(category) {
    const file = PRODUCT_FILES[category]; if (!file) return {};
    const data = JsonManager.load(file, {});
    return data && !Array.isArray(data) && typeof data === 'object' ? data : {};
  }
  loadAll() {
    const products = {};
    for (const category of Object.keys(PRODUCT_FILES)) {
      for (const [id, raw] of Object.entries(this.loadCategory(category))) {
        products[id] = { ...clone(raw), id, category, item_type: 'product' };
      }
    }
    return products;
  }
  get(id) { const value = this.loadAll()[ProductRegistry.normalizeId(id)]; return value ? clone(value) : null; }
  exists(id) { return this.get(id) !== null; }
  listCategory(category) { return Object.entries(this.loadCategory(category)).map(([id, raw]) => ({ ...clone(raw), id, category, item_type: 'product' })); }
  listAll() { return Object.values(this.loadAll()).map(clone); }
  search(query) { const q = String(query ?? '').trim().toLowerCase(); return this.listAll().filter((item) => String(item.id).toLowerCase().includes(q) || String(item.name ?? '').toLowerCase().includes(q)); }
  count() { return Object.keys(this.loadAll()).length; }
  countByCategory() { return Object.fromEntries(Object.keys(PRODUCT_FILES).map((category) => [category, this.listCategory(category).length])); }
}

import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { BUILDINGS_DATA_DIR } from '../config/settings.js';
const BUILDINGS_FILE = path.join(BUILDINGS_DATA_DIR, 'buildings.json');
export class ProductionRequirements {
  constructor(filePath = BUILDINGS_FILE) { this.path = filePath; JsonManager.ensureFile(this.path, {}); }
  static categoryFactoryLevel(category) { return ({ refining: 0, components: 0, tools: 0, machinery: 1, vehicles: 1 })[category] ?? 0; }
  getLevel(userId, buildingId) {
    const data = JsonManager.load(this.path, {}); const user = data?.[String(userId)] ?? {};
    const value = user?.[buildingId];
    if (typeof value === 'number') return Math.max(0, Math.trunc(value));
    return Math.max(0, Math.trunc(Number(value?.level ?? 0)));
  }
  check(userId, category) {
    const required = ProductionRequirements.categoryFactoryLevel(category);
    if (required <= 0) return [true, 'Infraestrutura disponível.'];
    const current = this.getLevel(userId, 'factory');
    if (current < required) return [false, `Essa produção exige 🏭 Fábrica nível ${required}.`];
    return [true, 'Infraestrutura disponível.'];
  }
  discountedEnergy(userId, baseEnergy) {
    const level = this.getLevel(userId, 'power_station');
    const discount = Math.min(0.50, level * 0.05);
    return Math.max(0, Math.trunc((Number(baseEnergy) || 0) * (1 - discount)));
  }
}

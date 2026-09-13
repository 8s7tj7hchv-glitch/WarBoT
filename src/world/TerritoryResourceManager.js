import { TerritoryManager } from './TerritoryManager.js';
export class TerritoryResourceManager {
  constructor({ territories = new TerritoryManager() } = {}) { this.territories = territories; }
  bonuses(territoryId) { return this.territories.get(territoryId)?.resource_bonus ?? {}; }
  multiplier(territoryId, category) { const v = Number(this.bonuses(territoryId)[String(category)] ?? 1); return Number.isFinite(v) && v > 0 ? v : 1; }
  summary(territoryId) { const t = this.territories.get(territoryId); return t ? { territory_id: t.id, territory_name: t.name, bonuses: { ...t.resource_bonus } } : null; }
}

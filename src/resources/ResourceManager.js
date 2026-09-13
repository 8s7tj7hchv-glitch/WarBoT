import { ResourceRegistry } from './ResourceRegistry.js';

export class ResourceManager {
  constructor(registry = new ResourceRegistry()) { this.registry = registry; }
  getResource(id) { return this.registry.get(id); }
  getName(id) { return this.getResource(id)?.name ?? String(id); }
  getBasePrice(id) { return Number(this.getResource(id)?.base_price ?? 0) || 0; }
  getWeight(id) { return Number(this.getResource(id)?.weight ?? 0) || 0; }
  getRarity(id) { return String(this.getResource(id)?.rarity ?? 'unknown'); }
  isTradeable(id) { const item = this.getResource(id); return item ? item.tradeable !== false : false; }
  isStorable(id) { const item = this.getResource(id); return item ? item.storable !== false : false; }
  calculateWeight(id, quantity) { return Math.max(0, Number(quantity) || 0) * this.getWeight(id); }
  calculateBaseValue(id, quantity) { return Math.max(0, Number(quantity) || 0) * this.getBasePrice(id); }
  normalizeQuality(id, quality) {
    const item = this.getResource(id); if (!item) return 0;
    const min = Math.trunc(Number(item.quality_min ?? 1));
    const max = Math.trunc(Number(item.quality_max ?? 100));
    return Math.max(min, Math.min(max, Math.trunc(Number(quality) || min)));
  }
  static qualityMultiplier(quality) { const q = Math.max(1, Math.min(100, Number(quality) || 1)); return 0.5 + q / 100; }
  calculateQualityValue(id, quantity, quality) {
    return Math.round(this.calculateBaseValue(id, quantity) * ResourceManager.qualityMultiplier(quality) * 100) / 100;
  }
}

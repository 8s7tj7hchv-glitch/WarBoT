import { ProductRegistry } from './ProductRegistry.js';
export class ProductManager {
  constructor(registry = new ProductRegistry()) { this.registry = registry; }
  getProduct(id) { return this.registry.get(id); }
  getName(id) { return this.getProduct(id)?.name ?? String(id); }
  getBasePrice(id) { return Number(this.getProduct(id)?.base_price ?? 0) || 0; }
  getWeight(id) { return Number(this.getProduct(id)?.weight ?? 0) || 0; }
  getRequiredLevel(id) { return Math.trunc(Number(this.getProduct(id)?.required_level ?? 1)); }
  isTradeable(id) { const item = this.getProduct(id); return item ? item.tradeable !== false : false; }
  isStorable(id) { const item = this.getProduct(id); return item ? item.storable !== false : false; }
  calculateValue(id, quantity) { return Math.round(this.getBasePrice(id) * Math.max(0, Number(quantity) || 0) * 100) / 100; }
  calculateWeight(id, quantity) { return Math.round(this.getWeight(id) * Math.max(0, Number(quantity) || 0) * 100) / 100; }
}

import { DEFAULT_INVENTORY_CAPACITY } from '../config/settings.js';
import { ItemRegistry } from '../core/ItemRegistry.js';

export class InventoryCapacity {
  constructor(itemRegistry = new ItemRegistry()) {
    this.items = itemRegistry;
  }

  itemWeight(itemId, quantity) {
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    return this.items.getWeight(itemId) * amount;
  }

  inventoryWeight(inventory) {
    let total = 0;
    const items = inventory?.items ?? {};

    for (const [itemId, lots] of Object.entries(items)) {
      if (!Array.isArray(lots)) continue;
      for (const lot of lots) {
        total += this.itemWeight(itemId, Number(lot?.quantity ?? 0));
      }
    }

    return Math.round(total * 100) / 100;
  }

  maxCapacity(inventory) {
    return Number(inventory?.capacity ?? DEFAULT_INVENTORY_CAPACITY);
  }

  availableCapacity(inventory) {
    return Math.max(0, Math.round((this.maxCapacity(inventory) - this.inventoryWeight(inventory)) * 100) / 100);
  }

  canStore(inventory, itemId, quantity) {
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount <= 0) return false;
    return this.itemWeight(itemId, amount) <= this.availableCapacity(inventory);
  }
}

import { factoryManager } from '../core/FactoryManager.js';
import { industrialInventory } from '../inventory/IndustrialInventory.js';

const MAINTENANCE_COST = Object.freeze({ industrial_parts: 2, mechanical_components: 2 });

export class FactoryMaintenanceManager {
  status(ownerId, factoryId) {
    const f = factoryManager.ensure(ownerId, factoryId);
    if (typeof f.condition !== 'number') f.condition = 100;
    if (typeof f.maintenanceCount !== 'number') f.maintenanceCount = 0;
    return { condition: f.condition, maintenanceCount: f.maintenanceCount, lastMaintenanceAt: f.lastMaintenanceAt ?? null };
  }

  wear(ownerId, factoryId, amount = 1) {
    const f = factoryManager.ensure(ownerId, factoryId);
    this.status(ownerId, factoryId);
    f.condition = Math.max(25, f.condition - Math.max(0, Number(amount) || 0));
    factoryManager.persist();
    return f.condition;
  }

  efficiencyFactor(ownerId, factoryId) {
    const { condition } = this.status(ownerId, factoryId);
    return Math.max(0.70, condition / 100);
  }

  maintain(ownerId, factoryId) {
    const f = factoryManager.ensure(ownerId, factoryId);
    this.status(ownerId, factoryId);
    if (f.condition >= 100) return { factory: f, changed: false, cost: {} };
    industrialInventory.consume(ownerId, MAINTENANCE_COST);
    f.condition = 100;
    f.maintenanceCount += 1;
    f.lastMaintenanceAt = new Date().toISOString();
    factoryManager.persist();
    return { factory: f, changed: true, cost: { ...MAINTENANCE_COST } };
  }
}

export const factoryMaintenanceManager = new FactoryMaintenanceManager();

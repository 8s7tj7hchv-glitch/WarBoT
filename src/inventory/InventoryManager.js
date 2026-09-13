import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
import { INVENTORY_DATA_DIR, DEFAULT_INVENTORY_CAPACITY } from '../config/settings.js';
import { InventoryCapacity } from './InventoryCapacity.js';

const INVENTORIES_FILE = path.join(INVENTORY_DATA_DIR, 'inventories.json');
const DEFAULT_INVENTORY = { capacity: DEFAULT_INVENTORY_CAPACITY, items: {} };
const clone = (value) => structuredClone(value);

export class InventoryManager {
  constructor(filePath = INVENTORIES_FILE, itemRegistry = new ItemRegistry()) {
    this.path = filePath;
    this.items = itemRegistry;
    this.storage = new InventoryCapacity(this.items);
    JsonManager.ensureFile(this.path, {});
  }

  key(userId) { return String(userId); }

  loadAll() {
    const data = JsonManager.load(this.path, {});
    return data && !Array.isArray(data) && typeof data === 'object' ? data : {};
  }

  saveAll(data) { JsonManager.save(this.path, data); }

  create(userId) {
    const data = this.loadAll();
    const key = this.key(userId);
    if (data[key]) return clone(data[key]);
    data[key] = clone(DEFAULT_INVENTORY);
    this.saveAll(data);
    return clone(data[key]);
  }

  get(userId) {
    const data = this.loadAll();
    const key = this.key(userId);
    return data[key] ? clone(data[key]) : this.create(userId);
  }

  save(userId, inventory) {
    const data = this.loadAll();
    data[this.key(userId)] = clone(inventory);
    this.saveAll(data);
  }

  addItem(userId, itemId, quantity, quality = 50) {
    const amount = Math.trunc(Number(quantity));
    if (!Number.isInteger(amount) || amount <= 0) return [false, 'Quantidade inválida.'];
    if (!this.items.get(itemId)) return [false, 'Item não encontrado.'];
    if (!this.items.isStorable(itemId)) return [false, 'Esse item não pode ser armazenado.'];

    const inventory = this.get(userId);
    if (!this.storage.canStore(inventory, itemId, amount)) return [false, 'Capacidade insuficiente.'];

    const normalizedQuality = Math.max(1, Math.min(100, Math.trunc(Number(quality) || 50)));
    inventory.items ??= {};
    inventory.items[itemId] ??= [];
    const lots = inventory.items[itemId];
    const lot = lots.find((entry) => Math.trunc(Number(entry?.quality ?? 0)) === normalizedQuality);

    if (lot) lot.quantity = Math.trunc(Number(lot.quantity ?? 0)) + amount;
    else lots.push({ quantity: amount, quality: normalizedQuality });

    this.save(userId, inventory);
    return [true, 'Item adicionado.'];
  }

  removeItem(userId, itemId, quantity) {
    const amount = Math.trunc(Number(quantity));
    if (!Number.isInteger(amount) || amount <= 0) return [false, 'Quantidade inválida.'];

    const inventory = this.get(userId);
    const lots = Array.isArray(inventory.items?.[itemId]) ? inventory.items[itemId] : [];
    const total = lots.reduce((sum, lot) => sum + Math.trunc(Number(lot?.quantity ?? 0)), 0);
    if (total < amount) return [false, 'Quantidade insuficiente.'];

    let remaining = amount;
    const ordered = clone(lots).sort((a, b) => Number(a?.quality ?? 0) - Number(b?.quality ?? 0));
    const newLots = [];

    for (const lot of ordered) {
      const current = Math.trunc(Number(lot?.quantity ?? 0));
      if (remaining <= 0) { newLots.push(lot); continue; }
      if (current <= remaining) { remaining -= current; continue; }
      lot.quantity = current - remaining;
      remaining = 0;
      newLots.push(lot);
    }

    if (newLots.length) inventory.items[itemId] = newLots;
    else delete inventory.items[itemId];
    this.save(userId, inventory);
    return [true, 'Item removido.'];
  }

  getQuantity(userId, itemId) {
    return (this.get(userId).items?.[itemId] ?? [])
      .reduce((sum, lot) => sum + Math.trunc(Number(lot?.quantity ?? 0)), 0);
  }

  hasItem(userId, itemId, quantity = 1) {
    return this.getQuantity(userId, itemId) >= Math.trunc(Number(quantity));
  }

  listItems(userId) {
    const inventory = this.get(userId);
    const result = [];

    for (const [itemId, lots] of Object.entries(inventory.items ?? {})) {
      if (!Array.isArray(lots)) continue;
      const item = this.items.get(itemId);
      if (!item) continue;

      const quantity = lots.reduce((sum, lot) => sum + Math.trunc(Number(lot?.quantity ?? 0)), 0);
      if (quantity <= 0) continue;
      const qualityTotal = lots.reduce((sum, lot) => sum + Math.trunc(Number(lot?.quantity ?? 0)) * Math.trunc(Number(lot?.quality ?? 50)), 0);

      result.push({
        id: itemId,
        name: item.name ?? itemId,
        emoji: item.emoji ?? '📦',
        item_type: item.item_type ?? 'unknown',
        quantity,
        quality: Math.trunc(qualityTotal / quantity),
        weight: Math.round(this.items.getWeight(itemId) * quantity * 100) / 100,
        base_value: Math.round(this.items.getBasePrice(itemId) * quantity * 100) / 100
      });
    }

    return result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  getUsedCapacity(userId) { return this.storage.inventoryWeight(this.get(userId)); }
  getMaxCapacity(userId) { return this.storage.maxCapacity(this.get(userId)); }
  getFreeCapacity(userId) { return this.storage.availableCapacity(this.get(userId)); }
}

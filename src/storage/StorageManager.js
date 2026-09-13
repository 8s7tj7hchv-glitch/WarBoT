import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
import {
  STORAGE_DATA_DIR,
  DEFAULT_WAREHOUSE_CAPACITY,
  DEFAULT_INDUSTRIAL_STORAGE_CAPACITY,
  DEFAULT_GARAGE_CAPACITY
} from '../config/settings.js';

const STORAGES_FILE = path.join(STORAGE_DATA_DIR, 'storages.json');
const DEFAULT_STORAGE = {
  warehouse: { capacity: DEFAULT_WAREHOUSE_CAPACITY, items: {} },
  industrial: { capacity: DEFAULT_INDUSTRIAL_STORAGE_CAPACITY, items: {} },
  garage: { capacity: DEFAULT_GARAGE_CAPACITY, items: {} }
};
const clone = (value) => structuredClone(value);

export class StorageManager {
  constructor(filePath = STORAGES_FILE, itemRegistry = new ItemRegistry()) {
    this.path = filePath;
    this.items = itemRegistry;
    JsonManager.ensureFile(this.path, {});
  }

  key(userId) { return String(userId); }
  validStorageType(type) { return ['warehouse', 'industrial', 'garage'].includes(type); }

  loadAll() {
    const data = JsonManager.load(this.path, {});
    return data && !Array.isArray(data) && typeof data === 'object' ? data : {};
  }

  saveAll(data) { JsonManager.save(this.path, data); }

  create(userId) {
    const data = this.loadAll();
    const key = this.key(userId);
    if (data[key]) return clone(data[key]);
    data[key] = clone(DEFAULT_STORAGE);
    this.saveAll(data);
    return clone(data[key]);
  }

  getAll(userId) {
    const data = this.loadAll();
    const key = this.key(userId);
    return data[key] ? clone(data[key]) : this.create(userId);
  }

  getStorage(userId, storageType) {
    return clone(this.getAll(userId)?.[storageType] ?? null);
  }

  saveStorage(userId, storageType, storage) {
    const data = this.loadAll();
    const key = this.key(userId);
    data[key] ??= clone(DEFAULT_STORAGE);
    if (!(storageType in data[key])) return false;
    data[key][storageType] = clone(storage);
    this.saveAll(data);
    return true;
  }

  isVehicle(itemId) {
    return this.items.get(itemId)?.category === 'vehicles';
  }

  getUsedWeight(userId, storageType) {
    const storage = this.getStorage(userId, storageType);
    if (!storage) return 0;
    let total = 0;
    for (const [itemId, lots] of Object.entries(storage.items ?? {})) {
      if (!Array.isArray(lots)) continue;
      const quantity = lots.reduce((sum, lot) => sum + Math.trunc(Number(lot?.quantity ?? 0)), 0);
      total += this.items.getWeight(itemId) * quantity;
    }
    return Math.round(total * 100) / 100;
  }

  getVehicleCount(userId) {
    const garage = this.getStorage(userId, 'garage');
    if (!garage) return 0;
    return Object.values(garage.items ?? {}).reduce((total, lots) => {
      if (!Array.isArray(lots)) return total;
      return total + lots.reduce((sum, lot) => sum + Math.trunc(Number(lot?.quantity ?? 0)), 0);
    }, 0);
  }

  getUsedCapacity(userId, storageType) {
    return storageType === 'garage' ? this.getVehicleCount(userId) : this.getUsedWeight(userId, storageType);
  }

  getMaxCapacity(userId, storageType) {
    return Number(this.getStorage(userId, storageType)?.capacity ?? 0);
  }

  getFreeCapacity(userId, storageType) {
    return Math.max(0, this.getMaxCapacity(userId, storageType) - this.getUsedCapacity(userId, storageType));
  }

  canStore(userId, storageType, itemId, quantity) {
    const amount = Math.trunc(Number(quantity));
    if (!Number.isInteger(amount) || amount <= 0) return [false, 'Quantidade inválida.'];
    if (!this.validStorageType(storageType)) return [false, 'Armazenamento inválido.'];
    const item = this.items.get(itemId);
    if (!item) return [false, 'Item não encontrado.'];
    if (!this.items.isStorable(itemId)) return [false, 'Esse item não pode ser armazenado.'];

    if (storageType === 'garage') {
      if (!this.isVehicle(itemId)) return [false, 'Somente veículos podem ser guardados na garagem.'];
      if (amount > this.getFreeCapacity(userId, storageType)) return [false, 'Garagem sem vagas suficientes.'];
      return [true, 'Pode armazenar.'];
    }

    const requiredWeight = this.items.getWeight(itemId) * amount;
    if (requiredWeight > this.getFreeCapacity(userId, storageType)) return [false, 'Capacidade insuficiente.'];
    return [true, 'Pode armazenar.'];
  }

  addItem(userId, storageType, itemId, quantity, quality = 50) {
    const [allowed, message] = this.canStore(userId, storageType, itemId, quantity);
    if (!allowed) return [false, message];
    const storage = this.getStorage(userId, storageType);
    if (!storage) return [false, 'Armazenamento não encontrado.'];

    const amount = Math.trunc(Number(quantity));
    const normalizedQuality = Math.max(1, Math.min(100, Math.trunc(Number(quality) || 50)));
    storage.items ??= {};
    storage.items[itemId] ??= [];
    const lot = storage.items[itemId].find((entry) => Math.trunc(Number(entry?.quality ?? 0)) === normalizedQuality);
    if (lot) lot.quantity = Math.trunc(Number(lot.quantity ?? 0)) + amount;
    else storage.items[itemId].push({ quantity: amount, quality: normalizedQuality });
    this.saveStorage(userId, storageType, storage);
    return [true, 'Item armazenado.'];
  }

  removeItem(userId, storageType, itemId, quantity) {
    const amount = Math.trunc(Number(quantity));
    if (!Number.isInteger(amount) || amount <= 0) return [false, 'Quantidade inválida.'];
    const storage = this.getStorage(userId, storageType);
    if (!storage) return [false, 'Armazenamento não encontrado.'];
    const lots = Array.isArray(storage.items?.[itemId]) ? storage.items[itemId] : [];
    const total = lots.reduce((sum, lot) => sum + Math.trunc(Number(lot?.quantity ?? 0)), 0);
    if (total < amount) return [false, 'Quantidade insuficiente.'];

    let remaining = amount;
    const newLots = [];
    for (const lot of clone(lots).sort((a, b) => Number(a?.quality ?? 0) - Number(b?.quality ?? 0))) {
      const current = Math.trunc(Number(lot?.quantity ?? 0));
      if (remaining <= 0) { newLots.push(lot); continue; }
      if (current <= remaining) { remaining -= current; continue; }
      lot.quantity = current - remaining;
      remaining = 0;
      newLots.push(lot);
    }

    if (newLots.length) storage.items[itemId] = newLots;
    else delete storage.items[itemId];
    this.saveStorage(userId, storageType, storage);
    return [true, 'Item removido.'];
  }

  getQuantity(userId, storageType, itemId) {
    const lots = this.getStorage(userId, storageType)?.items?.[itemId] ?? [];
    return Array.isArray(lots) ? lots.reduce((sum, lot) => sum + Math.trunc(Number(lot?.quantity ?? 0)), 0) : 0;
  }

  listItems(userId, storageType) {
    const storage = this.getStorage(userId, storageType);
    if (!storage) return [];
    const result = [];

    for (const [itemId, lots] of Object.entries(storage.items ?? {})) {
      if (!Array.isArray(lots)) continue;
      const item = this.items.get(itemId);
      if (!item) continue;
      const quantity = lots.reduce((sum, lot) => sum + Math.trunc(Number(lot?.quantity ?? 0)), 0);
      if (quantity <= 0) continue;
      const qualitySum = lots.reduce((sum, lot) => sum + Math.trunc(Number(lot?.quantity ?? 0)) * Math.trunc(Number(lot?.quality ?? 50)), 0);
      result.push({
        id: itemId,
        name: item.name ?? itemId,
        emoji: item.emoji ?? '📦',
        quantity,
        quality: Math.trunc(qualitySum / quantity),
        weight: Math.round(this.items.getWeight(itemId) * quantity * 100) / 100
      });
    }

    return result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }
}

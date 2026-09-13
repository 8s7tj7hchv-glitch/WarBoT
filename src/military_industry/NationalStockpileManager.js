import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_INDUSTRY_DATA_DIR } from '../config/settings.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
import { InventoryManager } from '../inventory/InventoryManager.js';
import { MilitaryStorageManager } from '../industrial/MilitaryStorageManager.js';
import { CountryManager } from '../world/CountryManager.js';
import { MilitaryComplexManager } from './MilitaryComplexManager.js';

const FILE = path.join(MILITARY_INDUSTRY_DATA_DIR, 'national_stockpiles.json');
const BASE_CAPACITY = 250000;
const clone = (v) => structuredClone(v);

export class NationalStockpileManager {
  constructor({ items = new ItemRegistry(), inventory = new InventoryManager(), militaryStorage = new MilitaryStorageManager(), countries = new CountryManager(), complexes = new MilitaryComplexManager() } = {}) {
    this.items = items;
    this.inventory = inventory;
    this.militaryStorage = militaryStorage;
    this.countries = countries;
    this.complexes = complexes;
    JsonManager.ensureFile(FILE, {});
  }

  load() { const d = JsonManager.load(FILE, {}); return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; }
  save(d) { JsonManager.save(FILE, d); }
  ensure(countryId) { const all = this.load(); const key = String(countryId); if (!all[key]) { all[key] = { capacity: BASE_CAPACITY, items: {}, updated_at: new Date().toISOString() }; this.save(all); } return clone(all[key]); }
  capacity(countryId) { const s = this.ensure(countryId); return Number(s.capacity ?? BASE_CAPACITY) + this.complexes.storageBonus(countryId); }
  used(countryId) { const s = this.ensure(countryId); let total = 0; for (const [id, lots] of Object.entries(s.items ?? {})) total += this.items.getWeight(id) * lots.reduce((n, l) => n + Number(l.quantity ?? 0), 0); return Math.round(total * 100) / 100; }
  free(countryId) { return Math.max(0, this.capacity(countryId) - this.used(countryId)); }
  getQuantity(countryId, itemId) { return (this.ensure(countryId).items?.[String(itemId)] ?? []).reduce((n, l) => n + Number(l.quantity ?? 0), 0); }

  canStore(countryId, itemId, quantity) {
    const item = this.items.get(itemId), q = Math.trunc(Number(quantity));
    if (!item) return [false, 'Item não encontrado.'];
    if (q <= 0) return [false, 'Quantidade inválida.'];
    const need = Math.max(0, this.items.getWeight(itemId)) * q;
    if (need > this.free(countryId)) return [false, 'Capacidade do estoque nacional insuficiente.'];
    return [true, 'Pode armazenar.'];
  }

  add(countryId, itemId, quantity, quality = 50) {
    const [ok, msg] = this.canStore(countryId, itemId, quantity); if (!ok) return [false, msg];
    const all = this.load(), key = String(countryId); all[key] ??= { capacity: BASE_CAPACITY, items: {} };
    const q = Math.trunc(Number(quantity)), qq = Math.max(1, Math.min(100, Math.trunc(Number(quality) || 50)));
    all[key].items ??= {}; all[key].items[itemId] ??= [];
    const lot = all[key].items[itemId].find((x) => Number(x.quality) === qq);
    if (lot) lot.quantity = Number(lot.quantity ?? 0) + q; else all[key].items[itemId].push({ quantity: q, quality: qq });
    all[key].updated_at = new Date().toISOString(); this.save(all); return [true, 'Item adicionado ao estoque nacional.'];
  }

  remove(countryId, itemId, quantity) {
    const q = Math.trunc(Number(quantity)); if (q <= 0) return [false, 'Quantidade inválida.'];
    const all = this.load(), key = String(countryId), s = all[key]; if (!s) return [false, 'Estoque nacional vazio.'];
    const lots = s.items?.[itemId] ?? [], total = lots.reduce((n, l) => n + Number(l.quantity ?? 0), 0); if (total < q) return [false, 'Quantidade insuficiente no estoque nacional.'];
    let remaining = q; const kept = [];
    for (const lot of clone(lots)) { if (remaining <= 0) { kept.push(lot); continue; } const take = Math.min(remaining, Number(lot.quantity ?? 0)); lot.quantity -= take; remaining -= take; if (lot.quantity > 0) kept.push(lot); }
    if (kept.length) s.items[itemId] = kept; else delete s.items[itemId]; s.updated_at = new Date().toISOString(); this.save(all); return [true, 'Item removido do estoque nacional.'];
  }

  list(countryId) {
    const s = this.ensure(countryId), out = [];
    for (const [id, lots] of Object.entries(s.items ?? {})) {
      const item = this.items.get(id); if (!item) continue;
      const quantity = lots.reduce((n, l) => n + Number(l.quantity ?? 0), 0);
      const quality = quantity ? Math.trunc(lots.reduce((n, l) => n + Number(l.quantity ?? 0) * Number(l.quality ?? 50), 0) / quantity) : 50;
      out.push({ id, name: item.name, emoji: item.emoji ?? '📦', quantity, quality, category: item.category });
    }
    return out;
  }

  depositFromPlayer(userId, itemId, quantity) {
    const country = this.countries.memberCountry(userId); if (!country) return [false, 'Você precisa pertencer a um país.', null];
    const item = this.items.get(itemId); if (!item) return [false, 'Item não encontrado.', null];
    const q = Math.trunc(Number(quantity)); if (q <= 0) return [false, 'Quantidade inválida.', null];
    const [can, msg] = this.canStore(country.id, itemId, q); if (!can) return [false, msg, null];
    let source = 'inventory', removed = false;
    if (item.requires_special_storage || this.items.isMilitary(itemId)) {
      const type = this.items.getStorageType(itemId); source = type;
      removed = this.militaryStorage.removeItem(userId, type, itemId, q)[0];
    } else removed = this.inventory.removeItem(userId, itemId, q)[0];
    if (!removed) return [false, 'Quantidade insuficiente no armazenamento do jogador.', null];
    const [added, addMsg] = this.add(country.id, itemId, q, 50);
    if (!added) {
      if (source === 'inventory') this.inventory.addItem(userId, itemId, q, 50); else this.militaryStorage.addItem(userId, source, itemId, q, 50);
      return [false, `${addMsg} Operação revertida.`, null];
    }
    return [true, 'Contribuição enviada ao estoque nacional.', { country_id: country.id, item_id: itemId, quantity: q, source }];
  }

  withdrawToPlayer(userId, itemId, quantity) {
    const country = this.countries.memberCountry(userId); if (!country) return [false, 'Você precisa pertencer a um país.', null];
    if (country.leader_id !== String(userId)) return [false, 'Somente o líder pode retirar do estoque nacional.', null];
    const item = this.items.get(itemId); if (!item) return [false, 'Item não encontrado.', null];
    const q = Math.trunc(Number(quantity)); if (q <= 0) return [false, 'Quantidade inválida.', null];
    if (this.getQuantity(country.id, itemId) < q) return [false, 'Quantidade insuficiente no estoque nacional.', null];
    let destination = 'inventory'; let can = true; let msg = '';
    if (item.requires_special_storage || this.items.isMilitary(itemId)) {
      destination = this.items.getStorageType(itemId); [can, msg] = this.militaryStorage.canStore(userId, destination, itemId, q);
    }
    if (!can) return [false, msg, null];
    const [removed] = this.remove(country.id, itemId, q); if (!removed) return [false, 'Falha ao retirar do estoque nacional.', null];
    const result = destination === 'inventory' ? this.inventory.addItem(userId, itemId, q, 50) : this.militaryStorage.addItem(userId, destination, itemId, q, 50);
    if (!result[0]) { this.add(country.id, itemId, q, 50); return [false, `${result[1]} Operação revertida.`, null]; }
    return [true, 'Item retirado do estoque nacional.', { item_id: itemId, quantity: q, destination }];
  }
}

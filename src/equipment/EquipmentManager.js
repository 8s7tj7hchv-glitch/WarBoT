import path from 'node:path'; import { randomUUID } from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js'; import { ItemRegistry } from '../core/ItemRegistry.js'; import { EQUIPMENT_DATA_DIR } from '../config/settings.js';
const FILE = path.join(EQUIPMENT_DATA_DIR, 'equipment.json'); const clone = structuredClone;
export class EquipmentManager {
  constructor(filePath = FILE) { this.path = filePath; this.items = new ItemRegistry(); JsonManager.ensureFile(this.path, {}); }
  loadAll() { return JsonManager.load(this.path, {}); } saveAll(d) { JsonManager.save(this.path, d); }
  create(userId, itemId, quality = 50) { const item = this.items.get(itemId); if (!item) return null; const max = Math.max(1, Math.trunc(Number(item.durability ?? 100))); const instance = { instance_id: randomUUID().replaceAll('-', ''), item_id: itemId, quality: Math.max(1, Math.min(100, Math.trunc(Number(quality) || 50))), durability: max, max_durability: max, upgrade_level: 0, active: true }; const d = this.loadAll(), k = String(userId); d[k] ??= []; d[k].push(instance); this.saveAll(d); return clone(instance); }
  listAll(userId) { return clone(this.loadAll()?.[String(userId)] ?? []); }
  get(userId, instanceId) { return this.listAll(userId).find((x) => x.instance_id === instanceId) ?? null; }
  saveInstance(userId, instance) { const d = this.loadAll(), k = String(userId), arr = d[k] ?? []; const i = arr.findIndex((x) => x.instance_id === instance.instance_id); if (i < 0) return false; arr[i] = clone(instance); d[k] = arr; this.saveAll(d); return true; }
  damage(userId, instanceId, amount) { const x = this.get(userId, instanceId); if (!x) return 0; x.durability = Math.max(0, Number(x.durability || 0) - Math.max(0, Number(amount) || 0)); x.active = x.durability > 0; this.saveInstance(userId, x); return x.durability; }
  repair(userId, instanceId, amount) { const x = this.get(userId, instanceId); if (!x) return 0; x.durability = Math.min(Number(x.max_durability || 100), Number(x.durability || 0) + Math.max(0, Number(amount) || 0)); x.active = x.durability > 0; this.saveInstance(userId, x); return x.durability; }
  upgrade(userId, instanceId, level) { const x = this.get(userId, instanceId); if (!x) return false; x.upgrade_level = Math.max(Number(x.upgrade_level || 0), Math.trunc(Number(level) || 0)); this.saveInstance(userId, x); return true; }
}

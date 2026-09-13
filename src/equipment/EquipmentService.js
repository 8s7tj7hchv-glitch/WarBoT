import { ItemRegistry } from '../core/ItemRegistry.js';
import { EquipmentManager } from './EquipmentManager.js';
import { InventoryManager } from '../inventory/InventoryManager.js';
import { StorageManager } from '../storage/StorageManager.js';
export class EquipmentService {
  constructor() { this.items = new ItemRegistry(); this.equipment = new EquipmentManager(); this.inventory = new InventoryManager(); this.storage = new StorageManager(); }
  isEquipmentItem(itemId) { const c = this.items.get(itemId)?.category; return ['tools', 'machinery', 'vehicles'].includes(c); }
  createInstances(userId, itemId, quantity, quality = 50) { const out = []; if (!this.isEquipmentItem(itemId)) return out; for (let i=0;i<Math.max(0,Math.trunc(quantity));i++) { const x=this.equipment.create(userId,itemId,quality); if(x) out.push(x); } return out; }
  bootstrapOwned(userId) {
    if (this.equipment.listAll(userId).length > 0) return 0;
    const owned = [...this.inventory.listItems(userId), ...this.storage.listItems(userId,'warehouse'), ...this.storage.listItems(userId,'industrial'), ...this.storage.listItems(userId,'garage')];
    let created = 0;
    for (const row of owned) if (this.isEquipmentItem(row.id)) created += this.createInstances(userId,row.id,row.quantity,row.quality).length;
    return created;
  }
  getBestActive(userId, itemId) { this.bootstrapOwned(userId); return this.equipment.listAll(userId).filter((x)=>x.item_id===itemId && x.active!==false && Number(x.durability)>0).sort((a,b)=>(b.upgrade_level-a.upgrade_level)||(b.quality-a.quality)||(b.durability-a.durability))[0] ?? null; }
}

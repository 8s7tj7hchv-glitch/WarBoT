import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { INDUSTRIAL_DATA_DIR } from '../config/settings.js';
import { LogisticsManager } from '../market/LogisticsManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
import { MilitaryStorageManager } from './MilitaryStorageManager.js';
import { EconomyService } from '../economy/EconomyService.js';
const FILE=path.join(INDUSTRIAL_DATA_DIR,'heavy_logistics.json');
export class HeavyLogisticsManager{
 constructor(){JsonManager.ensureFile(FILE,[]);this.base=new LogisticsManager();this.items=new ItemRegistry();this.storage=new MilitaryStorageManager();this.economy=new EconomyService();}
 classify(itemId){return String(this.items.get(itemId)?.logistics_class||'standard')}
 listOpen(limit=25){return this.base.listOpen(100).filter(s=>['heavy','oversized'].includes(this.classify(s.item_id))).slice(0,limit)}
 accept(userId,shipmentId){const s=this.base.get(shipmentId);if(!s)return [false,'Frete não encontrado.',null];const cls=this.classify(s.item_id);if(!['heavy','oversized'].includes(cls))return [false,'Esse frete não exige logística pesada.',null];return this.base.accept(userId,shipmentId)}
 deliver(userId,shipmentId){const s=this.base.get(shipmentId);if(!s)return [false,'Frete não encontrado.',null];if(!['heavy','oversized'].includes(this.classify(s.item_id)))return [false,'Esse frete não exige logística pesada.',null];const [ok,msg,delivered]=this.base.deliver(userId,shipmentId);if(!ok)return [ok,msg,delivered];const extra=Math.round(Number(s.reward||0)*0.5*100)/100;if(extra>0)this.economy.add(userId,extra);const all=this.base.load(),i=all.findIndex(x=>x.id===s.id);if(i>=0){all[i].heavy_logistics=true;all[i].heavy_bonus=extra;this.base.save(all);}return [true,`${msg} Bônus de carga pesada: $${extra.toFixed(2)}.`,i>=0?all[i]:delivered]}
}

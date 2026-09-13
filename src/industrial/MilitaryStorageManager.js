import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
import { INDUSTRIAL_DATA_DIR } from '../config/settings.js';

const FILE=path.join(INDUSTRIAL_DATA_DIR,'military_storages.json');
const DEFAULT={military_depot:{capacity:50000,items:{}},hangar:{capacity:12,items:{}},shipyard:{capacity:8,items:{}}};
const clone=v=>structuredClone(v);
export class MilitaryStorageManager{
 constructor(){JsonManager.ensureFile(FILE,{});this.items=new ItemRegistry();}
 load(){return JsonManager.load(FILE,{})} save(v){JsonManager.save(FILE,v)} key(id){return String(id)}
 getAll(userId){const d=this.load(),k=this.key(userId);if(!d[k]){d[k]=clone(DEFAULT);this.save(d)}return clone(d[k]);}
 get(userId,type){return clone(this.getAll(userId)?.[type]??null)}
 allowed(type,item){if(!item)return false;if(type==='hangar')return item.category==='aircraft';if(type==='shipyard')return ['naval_vessels','submarines'].includes(item.category);if(type==='military_depot')return ['military_components','military_vehicles','missile_systems'].includes(item.category)||item.storage_type==='military_depot';return false;}
 used(userId,type){const s=this.get(userId,type);if(!s)return 0;if(['hangar','shipyard'].includes(type))return Object.values(s.items??{}).flat().reduce((n,l)=>n+Number(l.quantity||0),0);let total=0;for(const [id,lots] of Object.entries(s.items??{}))total+=this.items.getWeight(id)*lots.reduce((n,l)=>n+Number(l.quantity||0),0);return Math.round(total*100)/100;}
 free(userId,type){const s=this.get(userId,type);return Math.max(0,Number(s?.capacity||0)-this.used(userId,type));}
 canStore(userId,type,itemId,quantity){const q=Math.trunc(Number(quantity)),item=this.items.get(itemId);if(q<=0)return [false,'Quantidade inválida.'];if(!this.get(userId,type))return [false,'Armazenamento estratégico inválido.'];if(!this.allowed(type,item))return [false,'Esse item exige outro tipo de armazenamento estratégico.'];const need=['hangar','shipyard'].includes(type)?q:this.items.getWeight(itemId)*q;if(need>this.free(userId,type))return [false,'Capacidade estratégica insuficiente.'];return [true,'Pode armazenar.'];}
 addItem(userId,type,itemId,quantity,quality=50){const [ok,msg]=this.canStore(userId,type,itemId,quantity);if(!ok)return [false,msg];const all=this.load(),k=this.key(userId);all[k]??=clone(DEFAULT);const s=all[k][type];s.items[itemId]??=[];const qq=Math.max(1,Math.min(100,Math.trunc(Number(quality)||50))),lot=s.items[itemId].find(x=>Number(x.quality)===qq);if(lot)lot.quantity=Number(lot.quantity||0)+Math.trunc(quantity);else s.items[itemId].push({quantity:Math.trunc(quantity),quality:qq});this.save(all);return [true,'Item armazenado.'];}
 removeItem(userId,type,itemId,quantity){const q=Math.trunc(Number(quantity)),all=this.load(),k=this.key(userId),s=all?.[k]?.[type];if(q<=0||!s)return [false,'Operação inválida.'];const lots=s.items?.[itemId]??[],total=lots.reduce((n,l)=>n+Number(l.quantity||0),0);if(total<q)return [false,'Quantidade insuficiente.'];let rem=q,out=[];for(const lot of clone(lots)){if(rem<=0){out.push(lot);continue}const take=Math.min(rem,Number(lot.quantity||0));lot.quantity-=take;rem-=take;if(lot.quantity>0)out.push(lot)}if(out.length)s.items[itemId]=out;else delete s.items[itemId];this.save(all);return [true,'Item removido.'];}
 getQuantity(userId,type,itemId){return (this.get(userId,type)?.items?.[itemId]??[]).reduce((n,l)=>n+Number(l.quantity||0),0)}
 listItems(userId,type){const s=this.get(userId,type);const out=[];for(const [id,lots] of Object.entries(s?.items??{})){const item=this.items.get(id);if(!item)continue;const quantity=lots.reduce((n,l)=>n+Number(l.quantity||0),0),quality=quantity?Math.trunc(lots.reduce((n,l)=>n+Number(l.quantity||0)*Number(l.quality||50),0)/quantity):50;out.push({id,name:item.name,emoji:item.emoji||'📦',quantity,quality});}return out;}
}

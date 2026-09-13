import path from 'node:path';
import crypto from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_DATA_DIR } from '../config/settings.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
import { MilitaryStorageManager } from '../industrial/MilitaryStorageManager.js';
import { CountryManager } from '../world/CountryManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
const FILE=path.join(MILITARY_DATA_DIR,'assets.json');
const clone=v=>structuredClone(v);
const branchFor=(item)=>item?.category==='aircraft'?'air_force':['naval_vessels','submarines'].includes(item?.category)?'navy':item?.category==='missile_systems'?'strategic':'army';
export class MilitaryAssetManager{
 constructor({items=new ItemRegistry(),storage=new MilitaryStorageManager(),countries=new CountryManager(),territories=new TerritoryManager()}={}){this.items=items;this.storage=storage;this.countries=countries;this.territories=territories;JsonManager.ensureFile(FILE,[])}
 load(){const d=JsonManager.load(FILE,[]);return Array.isArray(d)?d:[]}
 save(d){JsonManager.save(FILE,d)}
 list(countryId=null){return this.load().filter(x=>!countryId||x.country_id===String(countryId)).map(clone)}
 get(id){return clone(this.load().find(x=>x.id===String(id))??null)}
 commission({countryId,userId,itemId,quantity=1,territoryId=null}){const c=this.countries.get(countryId);if(!c)throw new Error('País não encontrado.');const item=this.items.get(itemId);if(!item||!this.items.isMilitary(itemId))throw new Error('Item militar fictício inválido.');const q=Math.max(1,Math.trunc(Number(quantity)||1));const type=this.items.getStorageType(itemId);const available=this.storage.getQuantity(userId,type,itemId);if(available<q)throw new Error(`Quantidade insuficiente em ${type}.`);let territory=null;if(territoryId){territory=this.territories.get(territoryId);if(!territory||territory.controller_country_id!==c.id)throw new Error('Território inválido para incorporação.');}const [ok,msg]=this.storage.removeItem(userId,type,itemId,q);if(!ok)throw new Error(msg);const d=this.load(),now=new Date().toISOString(),created=[];for(let n=0;n<q;n++){const a={id:`asset_${crypto.randomUUID()}`,country_id:c.id,item_id:item.id,name:item.name,emoji:item.emoji??'🛡️',branch:branchFor(item),territory_id:territory?.id??c.capital_territory_id??null,status:'reserve',readiness:50,condition:100,assigned_unit_id:null,source_user_id:String(userId),created_at:now,updated_at:now};d.push(a);created.push(clone(a))}this.save(d);return created}
 assign(assetId,unitId){const d=this.load(),i=d.findIndex(x=>x.id===String(assetId));if(i<0)throw new Error('Ativo não encontrado.');d[i].assigned_unit_id=String(unitId);d[i].status='active';d[i].readiness=Math.max(Number(d[i].readiness||0),60);d[i].updated_at=new Date().toISOString();this.save(d);return clone(d[i])}
 station(assetId,territoryId){const d=this.load(),i=d.findIndex(x=>x.id===String(assetId));if(i<0)throw new Error('Ativo não encontrado.');const t=this.territories.get(territoryId);if(!t||t.controller_country_id!==d[i].country_id)throw new Error('Território inválido para o ativo.');d[i].territory_id=t.id;d[i].updated_at=new Date().toISOString();this.save(d);return clone(d[i])}
 update(assetId,patch={}){const d=this.load(),i=d.findIndex(x=>x.id===String(assetId));if(i<0)throw new Error('Ativo não encontrado.');const protectedKeys=new Set(['id','country_id','created_at']);for(const [k,v] of Object.entries(patch??{}))if(!protectedKeys.has(k))d[i][k]=clone(v);d[i].updated_at=new Date().toISOString();this.save(d);return clone(d[i])}
 summary(countryId){const list=this.list(countryId);return {total:list.length,active:list.filter(x=>x.status==='active').length,reserve:list.filter(x=>x.status==='reserve').length,by_branch:Object.fromEntries(['army','air_force','navy','strategic'].map(b=>[b,list.filter(x=>x.branch===b).length]))}}
}

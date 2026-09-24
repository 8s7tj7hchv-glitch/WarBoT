import fs from 'node:fs';
import path from 'node:path';
import { industrialInventory } from '../inventory/IndustrialInventory.js';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';

const root=process.env.TNT_DATA_DIR||'./data';
const file=path.join(root,'military-factories','warehouses.json');
function ensureFile(){fs.mkdirSync(path.dirname(file),{recursive:true});if(!fs.existsSync(file))fs.writeFileSync(file,'{}\n');}
function load(){ensureFile();try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return {};}}
function save(v){ensureFile();const t=`${file}.tmp`;fs.writeFileSync(t,JSON.stringify(v,null,2));fs.renameSync(t,file);}

const BASE_CAPACITY=500;
const CAPACITY_PER_LEVEL=250;
const MAX_LEVEL=20;

export class IndustrialWarehouseManager {
 constructor(){this.state=load();}
 ensure(ownerId){if(!this.state[ownerId])this.state[ownerId]={level:1,expandedAt:null};return this.state[ownerId];}
 capacity(ownerId){const s=this.ensure(ownerId);return BASE_CAPACITY+((s.level-1)*CAPACITY_PER_LEVEL);}
 used(ownerId){const resources=industrialInventory.snapshot(ownerId).resources||{};return Object.values(resources).reduce((a,b)=>a+(Number(b)||0),0);}
 free(ownerId){return Math.max(0,this.capacity(ownerId)-this.used(ownerId));}
 canStore(ownerId,qty){return this.free(ownerId)>=Math.max(0,Number(qty)||0);}
 status(ownerId){const s=this.ensure(ownerId);const capacity=this.capacity(ownerId);const used=this.used(ownerId);return {...s,capacity,used,free:Math.max(0,capacity-used),percent:capacity?Math.min(100,Math.round((used/capacity)*100)):0,maxLevel:MAX_LEVEL,nextCost:this.upgradeCost(ownerId)};}
 upgradeCost(ownerId){const level=this.ensure(ownerId).level;return level>=MAX_LEVEL?0:1000+(level*750);}
 upgrade(ownerId){const s=this.ensure(ownerId);if(s.level>=MAX_LEVEL)throw new Error('Armazém já está no nível máximo.');const cost=this.upgradeCost(ownerId);industrialEconomyManager.debit(ownerId,cost,{type:'warehouse_upgrade',description:`Expansão do armazém industrial para nível ${s.level+1}`});s.level+=1;s.expandedAt=new Date().toISOString();save(this.state);return this.status(ownerId);}
}
export const industrialWarehouseManager=new IndustrialWarehouseManager();

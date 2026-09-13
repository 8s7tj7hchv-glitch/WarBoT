import path from 'node:path';
import crypto from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
import { MilitaryCatalog } from './MilitaryCatalog.js';
import { ForceManager } from './ForceManager.js';
const FILE=path.join(MILITARY_DATA_DIR,'units.json');
const clone=v=>structuredClone(v),clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
export class UnitManager{
 constructor({countries=new CountryManager(),territories=new TerritoryManager(),catalog=new MilitaryCatalog(),forces=new ForceManager()}={}){this.countries=countries;this.territories=territories;this.catalog=catalog;this.forces=forces;JsonManager.ensureFile(FILE,[])}
 load(){const d=JsonManager.load(FILE,[]);return Array.isArray(d)?d:[]}
 save(d){JsonManager.save(FILE,d)}
 get(id){return clone(this.load().find(x=>x.id===String(id))??null)}
 list(countryId=null){return this.load().filter(x=>!countryId||x.country_id===String(countryId)).map(clone)}
 create({countryId,templateId,name=null,territoryId=null,actorId=null}){const c=this.countries.get(countryId);if(!c)throw new Error('País não encontrado.');this.forces.ensure(c.id);const t=this.catalog.get(templateId);if(!t)throw new Error('Modelo de unidade inválido.');let territory=null;if(territoryId){territory=this.territories.get(territoryId);if(!territory||territory.controller_country_id!==c.id)throw new Error('A unidade só pode ser criada em território controlado pelo país.');}const now=new Date().toISOString();const u={id:`unit_${crypto.randomUUID()}`,country_id:c.id,template_id:t.id,name:String(name||t.name).trim().slice(0,60),branch:t.branch,territory_id:territory?.id??c.capital_territory_id??null,status:'active',readiness:clamp(t.base_readiness,0,100),morale:60,experience:0,game_stats:clone(t.game_stats??{}),assigned_assets:[],created_by:actorId?String(actorId):null,created_at:now,updated_at:now};const d=this.load();d.push(u);this.save(d);return clone(u)}
 station(unitId,territoryId,{actorId=null}={}){const d=this.load(),i=d.findIndex(x=>x.id===String(unitId));if(i<0)throw new Error('Unidade não encontrada.');const t=this.territories.get(territoryId);if(!t||t.controller_country_id!==d[i].country_id)throw new Error('Destino precisa estar sob controle do mesmo país.');const from=d[i].territory_id;d[i].territory_id=t.id;d[i].updated_at=new Date().toISOString();this.save(d);return {unit:clone(d[i]),from,to:t.id,actor_id:actorId?String(actorId):null}}
 train(unitId,amount=10){const d=this.load(),i=d.findIndex(x=>x.id===String(unitId));if(i<0)throw new Error('Unidade não encontrada.');const gain=Math.max(1,Math.min(20,Math.trunc(Number(amount)||10)));d[i].readiness=clamp(d[i].readiness+gain,0,100);d[i].morale=clamp(d[i].morale+Math.ceil(gain/2),0,100);d[i].experience=Math.max(0,Number(d[i].experience||0)+gain);d[i].updated_at=new Date().toISOString();this.save(d);return clone(d[i])}
 update(unitId,patch={}){const d=this.load(),i=d.findIndex(x=>x.id===String(unitId));if(i<0)throw new Error('Unidade não encontrada.');const protectedKeys=new Set(['id','country_id','created_at']);for(const [k,v] of Object.entries(patch??{}))if(!protectedKeys.has(k))d[i][k]=clone(v);d[i].updated_at=new Date().toISOString();this.save(d);return clone(d[i])}
 summary(countryId){const list=this.list(countryId);return {total:list.length,active:list.filter(x=>x.status==='active').length,average_readiness:list.length?Math.round(list.reduce((s,x)=>s+Number(x.readiness||0),0)/list.length):0,by_branch:Object.fromEntries(['army','air_force','navy','strategic'].map(b=>[b,list.filter(x=>x.branch===b).length]))}}
}

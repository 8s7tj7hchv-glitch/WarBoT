import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
const FILE=path.join(MILITARY_DATA_DIR,'forces.json');
const clone=v=>structuredClone(v);
const branches={army:{name:'Exército',emoji:'🪖'},air_force:{name:'Força Aérea',emoji:'✈️'},navy:{name:'Marinha',emoji:'⚓'},strategic:{name:'Comando Estratégico',emoji:'🛰️'}};
export class ForceManager{
 constructor({countries=new CountryManager()}={}){this.countries=countries;JsonManager.ensureFile(FILE,{})}
 load(){const d=JsonManager.load(FILE,{});return d&&typeof d==='object'&&!Array.isArray(d)?d:{}}
 save(d){JsonManager.save(FILE,d)}
 get(countryId){return clone(this.load()[String(countryId)]??null)}
 ensure(countryId){const c=this.countries.get(countryId);if(!c)throw new Error('País não encontrado.');const d=this.load();if(!d[c.id]){const now=new Date().toISOString();d[c.id]={country_id:c.id,name:`Forças Armadas de ${c.name}`,commander_id:c.leader_id,branches:Object.fromEntries(Object.entries(branches).map(([id,b])=>[id,{id,...b,enabled:true}])),doctrine:'balanced',created_at:now,updated_at:now};this.save(d)}return clone(d[c.id])}
 setCommander(countryId,userId){const d=this.load();const f=this.ensure(countryId);d[f.country_id]={...f,commander_id:String(userId),updated_at:new Date().toISOString()};this.save(d);return clone(d[f.country_id])}
 branches(){return clone(branches)}
}

import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { GLOBAL_WAR_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { AllianceManager } from '../diplomacy/AllianceManager.js';
import { GlobalEventManager } from './GlobalEventManager.js';
import { WorldEconomyIndex } from './WorldEconomyIndex.js';
import { WorldWarManager } from './WorldWarManager.js';
import { WorldRankingService } from './WorldRankingService.js';

const SNAPSHOTS=path.join(GLOBAL_WAR_DATA_DIR,'world_snapshots.json');
export class WorldWarHubService{
 constructor(){this.countries=new CountryManager();this.alliances=new AllianceManager();this.events=new GlobalEventManager();this.economy=new WorldEconomyIndex({events:this.events});this.wars=new WorldWarManager({countries:this.countries,alliances:this.alliances});this.rankings=new WorldRankingService({countries:this.countries,economy:this.economy});JsonManager.ensureFile(SNAPSHOTS,[])}
 dashboard(userId){const country=this.countries.memberCountry(userId);const activeWars=this.wars.list({status:'active'}).map(w=>this.wars.refresh(w.id));const global=this.economy.global();const rankings=this.rankings.calculate();const myWar=country?activeWars.find(w=>w.side_a.country_ids.includes(country.id)||w.side_b.country_ids.includes(country.id))??null:null;return{country,alliance:country?this.alliances.countryAlliance(country.id):null,active_wars:activeWars,my_war:myWar,economy:global,events:this.events.active(),rankings:rankings.slice(0,10)}}
 snapshot(){const data={created_at:new Date().toISOString(),economy:this.economy.global(),active_world_wars:this.wars.list({status:'active'}).length,active_events:this.events.active().length,rankings:this.rankings.calculate().slice(0,10)};const all=JsonManager.load(SNAPSHOTS,[]);all.push(data);JsonManager.save(SNAPSHOTS,all.slice(-200));return data}
 audit(){const issues=[];const ids=new Set(this.countries.list().map(c=>c.id));for(const w of this.wars.load()){for(const id of [...(w.side_a?.country_ids??[]),...(w.side_b?.country_ids??[])])if(!ids.has(id))issues.push(`Guerra ${w.id}: país inexistente ${id}`);const overlap=(w.side_a?.country_ids??[]).filter(id=>(w.side_b?.country_ids??[]).includes(id));if(overlap.length)issues.push(`Guerra ${w.id}: país presente nos dois lados`)}return{ok:issues.length===0,issues}}
}

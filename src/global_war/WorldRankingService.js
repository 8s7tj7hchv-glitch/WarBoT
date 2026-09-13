import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { GLOBAL_WAR_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
import { InfrastructureManager } from '../world/InfrastructureManager.js';
import { ConflictManager } from '../warfare/ConflictManager.js';
import { TreatyManager } from '../diplomacy/TreatyManager.js';
import { WorldEconomyIndex } from './WorldEconomyIndex.js';

const FILE = path.join(GLOBAL_WAR_DATA_DIR, 'world_rankings.json');
const CONFIG = path.join(GLOBAL_WAR_DATA_DIR, 'world_config.json');
export class WorldRankingService {
  constructor({ countries = new CountryManager(), territories = new TerritoryManager(), infrastructure = new InfrastructureManager(), conflicts = new ConflictManager(), treaties = new TreatyManager(), economy = new WorldEconomyIndex() } = {}) { this.countries=countries;this.territories=territories;this.infrastructure=infrastructure;this.conflicts=conflicts;this.treaties=treaties;this.economy=economy;JsonManager.ensureFile(FILE,[]); }
  calculate() {
    const cfg=JsonManager.load(CONFIG,{}).score??{};
    const rows=this.countries.list().map(c=>{
      const controlled=this.territories.list().filter(t=>t.controller_country_id===c.id);
      const infra=controlled.reduce((s,t)=>s+this.infrastructure.score(t.id),0);
      const wins=this.conflicts.list({countryId:c.id}).filter(x=>x.status==='ended'&&x.winner_country_id===c.id).length;
      const treaties=this.treaties.list({countryId:c.id,status:'active'}).length;
      const econ=this.economy.country(c.id);
      const score=wins*Number(cfg.battle_win??3)+controlled.length*Number(cfg.territory_control??2)+infra*Number(cfg.infrastructure_point??0.25)+treaties*Number(cfg.active_treaty??0.5)+(econ?.stability??0)*0.05;
      return {country_id:c.id,name:c.name,code:c.code,emoji:c.emoji,score:Number(score.toFixed(2)),controlled:controlled.length,infrastructure:infra,war_wins:wins,active_treaties:treaties,stability:econ?.stability??0};
    }).sort((a,b)=>b.score-a.score);
    JsonManager.save(FILE,rows.map((x,i)=>({...x,rank:i+1,generated_at:new Date().toISOString()}))); return rows.map((x,i)=>({...x,rank:i+1}));
  }
}

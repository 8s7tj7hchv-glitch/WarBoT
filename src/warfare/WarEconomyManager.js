import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { WARFARE_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
const FILE=path.join(WARFARE_DATA_DIR,'economic_effects.json');
export class WarEconomyManager{
 constructor({countries=new CountryManager(),territories=new TerritoryManager()}={}){this.countries=countries;this.territories=territories;JsonManager.ensureFile(FILE,[])}
 recordBattle(battle){const t=this.territories.get(battle.target_territory_id);const severity=Math.min(0.35,0.05+(battle.attacker_readiness_loss+battle.defender_readiness_loss)/300);const e={battle_id:battle.id,territory_id:t?.id??battle.target_territory_id,production_penalty:Number((severity*0.6).toFixed(3)),logistics_penalty:Number((severity*0.4).toFixed(3)),market_volatility:Number((severity*0.8).toFixed(3)),expires_after_battles:3,created_at:new Date().toISOString()};const all=JsonManager.load(FILE,[]);all.push(e);JsonManager.save(FILE,all);return e}
 list(territoryId=null){const d=JsonManager.load(FILE,[]);return (Array.isArray(d)?d:[]).filter(x=>!territoryId||x.territory_id===String(territoryId))}
 summary(){const d=this.list();return {effects:d.length,average_production_penalty:d.length?d.reduce((s,x)=>s+Number(x.production_penalty||0),0)/d.length:0,average_logistics_penalty:d.length?d.reduce((s,x)=>s+Number(x.logistics_penalty||0),0)/d.length:0}}
}

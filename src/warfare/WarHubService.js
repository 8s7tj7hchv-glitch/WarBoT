import { CountryManager } from '../world/CountryManager.js';
import { ConflictManager } from './ConflictManager.js';
import { BattleResolver } from './BattleResolver.js';
import { WarEconomyManager } from './WarEconomyManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
export class WarHubService{
 constructor(){this.countries=new CountryManager();this.conflicts=new ConflictManager({countries:this.countries});this.battles=new BattleResolver({conflicts:this.conflicts});this.economy=new WarEconomyManager({countries:this.countries});this.territories=new TerritoryManager()}
 dashboard(userId){const country=this.countries.memberCountry(userId);if(!country)return {country:null,active_conflicts:0,battles:0,controlled:0,effects:this.economy.summary()};const conflicts=this.conflicts.list({countryId:country.id,status:'active'});const battles=this.battles.list().filter(b=>b.attacker_country_id===country.id||b.defender_country_id===country.id);return {country,active_conflicts:conflicts.length,conflicts,battles:battles.length,recent_battles:battles.slice(-5).reverse(),controlled:this.territories.list().filter(t=>t.controller_country_id===country.id).length,effects:this.economy.summary()}}
}

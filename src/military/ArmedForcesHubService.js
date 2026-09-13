import { CountryManager } from '../world/CountryManager.js';
import { ForceManager } from './ForceManager.js';
import { UnitManager } from './UnitManager.js';
import { MilitaryAssetManager } from './MilitaryAssetManager.js';
export class ArmedForcesHubService{
 constructor(){this.countries=new CountryManager();this.forces=new ForceManager({countries:this.countries});this.units=new UnitManager({countries:this.countries,forces:this.forces});this.assets=new MilitaryAssetManager({countries:this.countries})}
 dashboard(userId){const country=this.countries.memberCountry(userId);if(!country)return {country:null,forces:null,units:{total:0,active:0,average_readiness:0,by_branch:{}},assets:{total:0,active:0,reserve:0,by_branch:{}}};return {country,forces:this.forces.ensure(country.id),units:this.units.summary(country.id),assets:this.assets.summary(country.id)}}
}

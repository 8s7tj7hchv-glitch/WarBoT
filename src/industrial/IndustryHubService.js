import { ItemRegistry } from '../core/ItemRegistry.js';
import { RecipeRegistry } from '../production/RecipeRegistry.js';
import { MilitaryFacilityManager } from './MilitaryFacilityManager.js';
import { MilitaryStorageManager } from './MilitaryStorageManager.js';
import { MilitaryTradePolicy } from './MilitaryTradePolicy.js';
import { HeavyLogisticsManager } from './HeavyLogisticsManager.js';
export class IndustryHubService{
 constructor(){this.items=new ItemRegistry();this.recipes=new RecipeRegistry();this.facilities=new MilitaryFacilityManager();this.storage=new MilitaryStorageManager();this.policy=new MilitaryTradePolicy();this.logistics=new HeavyLogisticsManager();}
 dashboard(userId,guildId){const militaryItems=Object.values(this.items.loadAll()).filter(i=>this.policy.isMilitary(i.id));return {items:militaryItems.length,recipes:this.recipes.listCategory('military').length,facilities:this.facilities.list(userId),storages:['military_depot','hangar','shipyard'].map(type=>({type,used:this.storage.used(userId,type),free:this.storage.free(userId,type),items:this.storage.listItems(userId,type)})),trade_policy:guildId?this.policy.getGuild(guildId):null,heavy_shipments:this.logistics.listOpen(25).length};}
 audit(){const issues=[];for(const r of this.recipes.listCategory('military')){if(!this.items.get(r.output?.item_id))issues.push({type:'MISSING_OUTPUT',recipe:r.id,item:r.output?.item_id});for(const id of Object.keys(r.inputs??{}))if(!this.items.get(id))issues.push({type:'MISSING_INPUT',recipe:r.id,item:id});if(!this.facilities.getDefinition(r.facility))issues.push({type:'MISSING_FACILITY',recipe:r.id,facility:r.facility});}return {ok:issues.length===0,issues};}
}

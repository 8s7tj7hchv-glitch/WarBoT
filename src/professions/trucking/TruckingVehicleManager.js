import { EquipmentService } from '../../equipment/EquipmentService.js';
import { ItemRegistry } from '../../core/ItemRegistry.js';
export class TruckingVehicleManager{
  constructor(){this.service=new EquipmentService();this.equipment=this.service.equipment;this.items=new ItemRegistry();}
  listVehicles(u){this.service.bootstrapOwned(u);return this.equipment.listAll(u).flatMap(instance=>{const item=this.items.get(instance.item_id);if(!item||item.category!=='vehicles'||Number(instance.durability)<=0||Number(item.cargo_capacity??0)<=0)return[];return[{instance_id:instance.instance_id,id:instance.item_id,name:item.name??instance.item_id,emoji:item.emoji??'🚚',cargo_capacity:Number(item.cargo_capacity??0),quality:Number(instance.quality??50),durability:Number(instance.durability??0),max_durability:Number(instance.max_durability??100),upgrade_level:Number(instance.upgrade_level??0)}];});}
  getBestVehicle(u){return this.listVehicles(u).sort((a,b)=>(b.cargo_capacity-a.cargo_capacity)||(b.upgrade_level-a.upgrade_level))[0]??null;}
}

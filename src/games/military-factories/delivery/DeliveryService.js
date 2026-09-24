import { industrialInventory } from '../inventory/IndustrialInventory.js';
import { FactoryDeliveryService } from '../integration/FactoryDeliveryService.js';
export class DeliveryService {
 constructor({arsenalService}={}){this.bridge=new FactoryDeliveryService({arsenalService});}
 async send({ownerId,guildId,countryId,itemId,quantity=1,sourceFactory}){quantity=Math.max(1,Math.floor(Number(quantity)||1));industrialInventory.removeStock(ownerId,itemId,quantity);try{const p=await this.bridge.deliver({guildId,countryId,itemId,quantity,sourceFactory});industrialInventory.logDelivery(ownerId,{...p,status:'delivered'});return p;}catch(e){industrialInventory.addStock(ownerId,itemId,quantity);throw e;}}
}

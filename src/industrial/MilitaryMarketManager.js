import { MarketManager } from '../market/MarketManager.js';
import { InternationalMarketManager } from '../market/InternationalMarketManager.js';
import { MilitaryTradePolicy } from './MilitaryTradePolicy.js';
import { MilitaryStorageManager } from './MilitaryStorageManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
export class MilitaryMarketManager{
 constructor(){this.local=new MarketManager();this.international=new InternationalMarketManager();this.policy=new MilitaryTradePolicy();this.storage=new MilitaryStorageManager();this.items=new ItemRegistry();}
 listItems(){return Object.values(this.items.loadAll()).filter(i=>this.policy.isMilitary(i.id));}
 createLocalSell(userId,itemId,quantity,price){const [p,m]=this.policy.canTrade(itemId);if(!p)return [false,m,null];const item=this.items.get(itemId),type=item?.storage_type||'military_depot';const q=Math.trunc(Number(quantity));if(this.storage.getQuantity(userId,type,itemId)<q)return [false,'Quantidade insuficiente no armazenamento estratégico.',null];const [removed]=this.storage.removeItem(userId,type,itemId,q);if(!removed)return [false,'Falha ao reservar equipamento.',null];const [ok,msg,order]=this.local.createSellOrder(userId,itemId,q,price);if(!ok)this.storage.addItem(userId,type,itemId,q,50);return [ok,msg,order];}
 createLocalBuy(userId,itemId,quantity,price){const [p,m]=this.policy.canTrade(itemId);if(!p)return [false,m,null];return this.local.createBuyOrder(userId,itemId,quantity,price);}
 createInternationalSell(userId,guildId,guildName,itemId,quantity,price){const [p,m]=this.policy.canTrade(itemId,{international:true,guildId});if(!p)return [false,m,null];const item=this.items.get(itemId),type=item?.storage_type||'military_depot',q=Math.trunc(Number(quantity));if(this.storage.getQuantity(userId,type,itemId)<q)return [false,'Quantidade insuficiente no armazenamento estratégico.',null];const [removed]=this.storage.removeItem(userId,type,itemId,q);if(!removed)return [false,'Falha ao reservar equipamento.',null];const [ok,msg,order]=this.international.createSellOrder(userId,guildId,guildName,itemId,q,price);if(!ok)this.storage.addItem(userId,type,itemId,q,50);return [ok,msg,order];}
 createInternationalBuy(userId,guildId,guildName,itemId,quantity,price){const [p,m]=this.policy.canTrade(itemId,{international:true,guildId});if(!p)return [false,m,null];return this.international.createBuyOrder(userId,guildId,guildName,itemId,quantity,price);}
}

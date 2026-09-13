import { NotificationManager } from './NotificationManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
const money=v=>`$${Number(v??0).toFixed(2)}`;
export class TradeNotificationService{
 constructor({notifications=new NotificationManager(),items=new ItemRegistry()}={}){this.notifications=notifications;this.items=items;}
 describe(itemId,qty,cash){const parts=[];if(itemId&&qty)parts.push(`${this.items.getEmoji(itemId)} ${this.items.getName(itemId)} ×${qty}`);if(Number(cash)>0)parts.push(`💰 ${money(cash)}`);return parts.join('\n')||'Nada';}
 async proposal(interaction,trade){if(!interaction.guildId)return;return this.notifications.send(interaction,interaction.guildId,'trades',{title:'Nova proposta de troca',emoji:'🔄',fields:[{name:'De',value:`<@${trade.proposer_id}>`,inline:true},{name:'Para',value:`<@${trade.target_id}>`,inline:true},{name:'Oferece',value:this.describe(trade.offer_item_id,trade.offer_quantity,trade.offer_money)},{name:'Pede',value:this.describe(trade.request_item_id,trade.request_quantity,trade.request_money)},{name:'ID',value:`\`${trade.id}\``}]});}
 async completed(interaction,trade){if(!interaction.guildId)return;return this.notifications.send(interaction,interaction.guildId,'trades',{title:'Troca concluída',emoji:'✅',description:`<@${trade.proposer_id}> ↔ <@${trade.target_id}>`,fields:[{name:'Troca',value:`\`${trade.id}\``}]});}
}

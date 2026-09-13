import { NotificationManager } from './NotificationManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';

export class MarketNotificationService {
  constructor({ notifications=new NotificationManager(), items=new ItemRegistry() }={}){this.notifications=notifications;this.items=items;}
  async order(interaction,{side,order,international=false}){
    if(!interaction.guildId || !order) return;
    const item=this.items.get(order.item_id); const buy=side==='buy';
    const filled=Number(order.match_result?.filled??0);
    return this.notifications.send(interaction,interaction.guildId,'market',{
      title: buy?'Nova ordem de compra':'Nova ordem de venda',emoji:buy?'🟢':'🔴',
      description: international?'🌐 Mercado internacional':'📈 Mercado local',
      fields:[
        {name:'Jogador',value:`<@${interaction.user.id}>`,inline:true},
        {name:'Produto',value:`${item?.emoji??'📦'} **${item?.name??order.item_id}**`,inline:true},
        {name:'Quantidade',value:String(order.quantity??order.remaining??0),inline:true},
        {name:'Preço unitário',value:`$${Number(order.unit_price??0).toFixed(2)}`,inline:true},
        {name:'Ordem',value:`\`${order.id}\``,inline:true},
        {name:'Executado agora',value:`${filled} unidade(s)`,inline:true}
      ]
    });
  }
}

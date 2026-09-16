import {giveawayManager} from './GiveawayManager.js';
import {buildPublicGiveaway} from './components/giveawayMessage.js';
import {giveawayAuditLogger} from './GiveawayAuditLogger.js';
class GiveawayScheduler{
 constructor(){this.client=null;this.timer=null;this.processing=new Set();}
 start(client){
  if(this.timer)return;this.client=client;this.tick().catch(console.error);
  this.timer=setInterval(()=>this.tick().catch(console.error),15000);
  console.log('🎁 GiveawayScheduler iniciado.');
 }
 async tick(){
  for(const scheduled of await giveawayManager.listScheduled()){
   if(scheduled.startsAt<=Date.now()&&!this.processing.has(scheduled.id)){
    this.processing.add(scheduled.id);
    try{
     const g=await giveawayManager.activateScheduled(scheduled.id);
     if(g){
      const guild=await this.client.guilds.fetch(g.guildId);
      const channel=await guild.channels.fetch(g.channelId);
      if(channel?.isTextBased()){
       const message=await channel.send(buildPublicGiveaway(g));
       await giveawayManager.update(g.id,{messageId:message.id});
      }
     }
    }catch(e){console.error('❌ Falha ao iniciar sorteio agendado:',e)}
    finally{this.processing.delete(scheduled.id)}
   }
  }

  for(const g of await giveawayManager.listActive()){
   if(g.endsAt<=Date.now()&&!this.processing.has(g.id)){
    this.processing.add(g.id);try{await this.finish(g.id)}finally{this.processing.delete(g.id)}
   }
  }
 }
 async finish(id){
  const g=await giveawayManager.finish(id);if(!g||g.status!=='ended')return;
  await giveawayAuditLogger.log({guildId:g.guildId,giveawayId:g.id,action:'end'});
  try{
   const guild=await this.client.guilds.fetch(g.guildId);
   const channel=await guild.channels.fetch(g.channelId);if(!channel?.isTextBased())return;
   if(g.messageId){try{const m=await channel.messages.fetch(g.messageId);await m.edit(buildPublicGiveaway(g))}catch{}}
   await channel.send(g.winners.length
    ?`🎉 Parabéns ${g.winners.map(x=>`<@${x}>`).join(', ')}! Vocês venceram **${g.prize}**!`
    :`🏁 O sorteio **${g.prize}** terminou sem participantes elegíveis.`);
  }catch(e){console.error('❌ Resultado do sorteio:',e)}
 }
}
export const giveawayScheduler=new GiveawayScheduler();

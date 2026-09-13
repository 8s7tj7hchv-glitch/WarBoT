import { EmbedBuilder } from 'discord.js';
import { GameChannelManager } from './GameChannelManager.js';

export class NotificationManager {
  constructor({ channels = new GameChannelManager() } = {}){ this.channels=channels; }
  async send(interactionOrClient,guildId,type,{title,description='',fields=[],emoji='',color=0xF5A623,content=null}={}){
    const channelId=this.channels.getChannelId(guildId,type); if(!channelId) return {sent:false,reason:'not_configured'};
    const client=interactionOrClient?.client ?? interactionOrClient;
    if(!client?.channels?.fetch) return {sent:false,reason:'client_unavailable'};
    try{
      const channel=await client.channels.fetch(channelId);
      if(!channel?.isTextBased?.() || typeof channel.send!=='function') return {sent:false,reason:'invalid_channel'};
      const embed=new EmbedBuilder().setColor(color).setTitle(`${emoji ? `${emoji} ` : ''}${title}`).setDescription(description || null).setTimestamp();
      if(fields.length) embed.addFields(fields.slice(0,25));
      await channel.send({content:content || undefined,embeds:[embed]});
      return {sent:true};
    }catch(error){ return {sent:false,reason:'send_failed',error:String(error?.message??error)}; }
  }
}

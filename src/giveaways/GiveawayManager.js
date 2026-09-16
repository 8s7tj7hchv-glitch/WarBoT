import { giveawayStore } from './GiveawayStore.js';
import { createGiveawayId } from './utils/giveawayIds.js';
import { pickWeightedUnique } from './utils/random.js';

class GiveawayManager {
  async create(data) {
    return giveawayStore.set({
      id:createGiveawayId(), guildId:data.guildId, creatorId:data.creatorId,
      prize:data.prize, description:data.description||'Sem descrição.',
      channelId:data.channelId, winnerCount:data.winnerCount, durationMs:data.durationMs,
      createdAt:Date.now(), endsAt:Date.now()+data.durationMs, status:'active',
      participants:[], winners:[], messageId:null, rerollHistory:[],
      requirements:{requiredRoleIds:[],blockedRoleIds:[],minAccountAgeDays:0,minServerAgeDays:0},
      entryConfig:{roleBonuses:{}}, participantEntries:{}
    });
  }
  async update(id, patch) {
    const g=await giveawayStore.get(id); if(!g) return null;
    return giveawayStore.set({...g,...patch,updatedAt:Date.now()});
  }
  async get(id){return giveawayStore.get(id);}
  async listByGuild(guildId){return (await giveawayStore.list()).filter(g=>g.guildId===guildId);}

  async schedule(data) {
    const now=Date.now();
    return giveawayStore.set({
      id:createGiveawayId(),guildId:data.guildId,creatorId:data.creatorId,
      prize:data.prize,description:data.description||'Sem descrição.',
      channelId:data.channelId,winnerCount:data.winnerCount,durationMs:data.durationMs,
      createdAt:now,startsAt:data.startsAt,endsAt:null,status:'scheduled',
      participants:[],winners:[],messageId:null,rerollHistory:[],
      requirements:{requiredRoleIds:[],blockedRoleIds:[],minAccountAgeDays:0,minServerAgeDays:0},
      entryConfig:{roleBonuses:{}},participantEntries:{}
    });
  }
  async listScheduled(){return (await giveawayStore.list()).filter(g=>g.status==='scheduled');}
  async activateScheduled(id){
    const g=await this.get(id);if(!g||g.status!=='scheduled')return null;
    const now=Date.now();
    return this.update(id,{status:'active',startedAt:now,endsAt:now+g.durationMs});
  }

  async listActive(){return (await giveawayStore.list()).filter(g=>g.status==='active');}
  async cancel(id){return this.update(id,{status:'cancelled',endedAt:Date.now()});}
  async finish(id){
    const g=await this.get(id); if(!g||g.status!=='active') return g;
    return this.update(id,{status:'ended',endedAt:Date.now(),
      winners:pickWeightedUnique(
        g.participants.map(userId=>({userId,weight:g.participantEntries?.[userId]||1})),
        g.winnerCount
      )});
  }
  async end(id){return this.finish(id);}

  async rerollOne(id, oldWinnerId=null) {
    const g=await this.get(id);
    if(!g || g.status!=='ended') return null;
    const excluded=new Set(g.winners||[]);
    if(oldWinnerId) excluded.delete(oldWinnerId);
    const candidates=g.participants
      .filter(userId=>!excluded.has(userId) && userId!==oldWinnerId)
      .map(userId=>({userId,weight:g.participantEntries?.[userId]||1}));
    const picked=pickWeightedUnique(candidates,1)[0];
    if(!picked) return {giveaway:g,newWinner:null};

    let winners=[...(g.winners||[])];
    let replaced=null;
    if(oldWinnerId && winners.includes(oldWinnerId)) {
      replaced=oldWinnerId;
      winners=winners.map(x=>x===oldWinnerId?picked:x);
    } else {
      replaced=winners[0]||null;
      if(winners.length) winners[0]=picked; else winners=[picked];
    }
    const history=[...(g.rerollHistory||[]),{
      type:'single',at:Date.now(),oldWinners:replaced?[replaced]:[],newWinners:[picked]
    }];
    const updated=await this.update(id,{winners,rerollHistory:history});
    return {giveaway:updated,newWinner:picked,replaced};
  }

  async rerollAll(id) {
    const g=await this.get(id);
    if(!g || g.status!=='ended') return null;
    const oldWinners=[...(g.winners||[])];
    const candidates=g.participants
      .filter(userId=>!oldWinners.includes(userId))
      .map(userId=>({userId,weight:g.participantEntries?.[userId]||1}));
    const newWinners=pickWeightedUnique(candidates,g.winnerCount);
    if(!newWinners.length) return {giveaway:g,newWinners:[]};
    const history=[...(g.rerollHistory||[]),{
      type:'all',at:Date.now(),oldWinners,newWinners
    }];
    const updated=await this.update(id,{winners:newWinners,rerollHistory:history});
    return {giveaway:updated,newWinners};
  }

  async remove(id){return giveawayStore.remove(id);}
}
export const giveawayManager=new GiveawayManager();

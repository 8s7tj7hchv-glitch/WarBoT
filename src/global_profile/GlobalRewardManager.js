import path from 'node:path';
import crypto from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { DATA_DIR } from '../config/settings.js';
import { GlobalProfileManager } from './GlobalProfileManager.js';

const FILE = path.join(DATA_DIR, 'global_profile', 'reward_inbox.json');
export class GlobalRewardManager {
  constructor(filePath=FILE, profiles=new GlobalProfileManager()) { this.path=filePath; this.profiles=profiles; JsonManager.ensureFile(this.path, []); }
  _all(){ const d=JsonManager.load(this.path,[]); return Array.isArray(d)?d:[]; } _save(d){JsonManager.save(this.path,d);}
  sendByGameId({actorId,gameId,rewardType='custom',title='Recompensa',description='',amount=null,source='owner'}) {
    const profile=this.profiles.getByGameId(gameId); if(!profile) throw new Error('Game ID não encontrado.');
    const all=this._all(); const r={id:`RWD-${crypto.randomUUID().slice(0,8).toUpperCase()}`,game_id:profile.game_id,discord_user_id:profile.discord_user_id,origin_guild_id:profile.origin_guild_id,reward_type:String(rewardType),title:String(title).slice(0,100),description:String(description).slice(0,1000),amount:amount===null?null:Number(amount),source:String(source),sent_by:String(actorId),status:'pending',created_at:new Date().toISOString(),claimed_at:null};
    all.push(r); this._save(all); return {reward:r,profile};
  }
  inbox(userId,{status='pending'}={}) { return this._all().filter(r=>r.discord_user_id===String(userId) && (!status||r.status===status)); }
  claim(userId,rewardId) { const all=this._all(); const r=all.find(x=>x.id===rewardId&&x.discord_user_id===String(userId)); if(!r) throw new Error('Recompensa não encontrada.'); if(r.status!=='pending') throw new Error('Essa recompensa já foi resgatada.'); r.status='claimed'; r.claimed_at=new Date().toISOString(); this._save(all); return r; }
}

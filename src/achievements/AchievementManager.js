import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from '../config/settings.js';
import { JsonManager } from '../core/JsonManager.js';
import { StatisticsManager } from '../players/StatisticsManager.js';
import { ProfileManager } from '../players/ProfileManager.js';
import { WalletManager } from '../economy/WalletManager.js';
import { ProPlayerManager } from '../pro/ProPlayerManager.js';
import { BonusManager } from '../bonuses/BonusManager.js';

const DIR=path.join(DATA_DIR,'achievements');
const CATALOG=path.join(DIR,'achievement_catalog.json');
const PLAYERS=path.join(DIR,'player_achievements.json');
const HISTORY=path.join(DIR,'achievement_history.json');
const now=()=>new Date().toISOString();
export class AchievementManager {
 constructor(){JsonManager.ensureFile(PLAYERS,{});JsonManager.ensureFile(HISTORY,[]);this.stats=new StatisticsManager();this.players=new ProfileManager();this.wallet=new WalletManager();this.pro=new ProPlayerManager();this.bonuses=new BonusManager();}
 catalog(){try{return JSON.parse(fs.readFileSync(CATALOG,'utf8'));}catch{return {};}}
 _all(){return JsonManager.load(PLAYERS,{});} _save(v){JsonManager.save(PLAYERS,v);}
 profile(uid){const k=String(uid),all=this._all();all[k]??={events:{},unlocked:{}};this._save(all);return structuredClone(all[k]);}
 recordEvent(uid,event,amount=1){const k=String(uid),all=this._all();all[k]??={events:{},unlocked:{}};all[k].events[event]=Number(all[k].events[event]||0)+Number(amount||0);this._save(all);return this.sync(uid);}
 sync(uid){const k=String(uid),all=this._all();all[k]??={events:{},unlocked:{}};const state=all[k],stats=this.stats.get(k),catalog=this.catalog(),fresh=[];
  for(const [id,a] of Object.entries(catalog)){if(state.unlocked[id])continue;const current=a.metric?Number(stats[a.metric]||0):Number(state.events[a.event]||0);if(current>=Number(a.target||1)){state.unlocked[id]={at:now(),claimed:false};fresh.push(id);}}
  this._save(all);return fresh;
 }
 list(uid){this.sync(uid);const s=this.profile(uid),c=this.catalog();return Object.entries(c).map(([id,a])=>{const current=a.metric?Number(this.stats.get(uid)[a.metric]||0):Number(s.events[a.event]||0);return{id,...a,current,unlocked:!!s.unlocked[id],claimed:!!s.unlocked[id]?.claimed,unlocked_at:s.unlocked[id]?.at??null};});}
 claim(uid,id){this.sync(uid);const k=String(uid),all=this._all(),state=all[k],def=this.catalog()[id];if(!def||!state?.unlocked?.[id])throw new Error('Conquista ainda não desbloqueada.');if(state.unlocked[id].claimed)throw new Error('Recompensa já resgatada.');const r=def.rewards||{};
  if(r.money)this.wallet.add(k,r.money);if(r.pro_points)this.pro.addPoints(k,r.pro_points);if(r.xp){const p=this.players.getOrCreate(k,'');p.xp=Number(p.xp||0)+Number(r.xp);this.players.saveProfile(k,p);}if(r.bonus)this.bonuses.grant(k,r.bonus,{source:'achievement',sourceId:id});
  state.unlocked[id].claimed=true;state.unlocked[id].claimed_at=now();this._save(all);const h=JsonManager.load(HISTORY,[]);h.push({user_id:k,achievement_id:id,at:now(),rewards:r});JsonManager.save(HISTORY,h.slice(-10000));return{definition:def,rewards:r};
 }
 summary(uid){const list=this.list(uid);return{total:list.length,unlocked:list.filter(x=>x.unlocked).length,pending:list.filter(x=>x.unlocked&&!x.claimed).length,list};}
}

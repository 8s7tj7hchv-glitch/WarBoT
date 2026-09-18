import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { DATA_DIR } from '../config/settings.js';
import { VipManager } from '../owner/VipManager.js';

const DIR=path.join(DATA_DIR,'pro');
const PROFILE=path.join(DIR,'profiles.json');
const HISTORY=path.join(DIR,'pro_history.json');
const now=()=>new Date().toISOString();

export class ProPlayerManager {
  constructor(){this.vip=new VipManager();JsonManager.ensureFile(PROFILE,{});JsonManager.ensureFile(HISTORY,[]);}
  profiles(){return JsonManager.load(PROFILE,{});}
  saveProfiles(v){JsonManager.save(PROFILE,v);}
  history(){return JsonManager.load(HISTORY,[]);}
  isPro(uid){return this.vip.isPro(uid);}
  profile(uid){const id=String(uid);const all=this.profiles();all[id]??={user_id:id,pro_points:0,streak:0,last_daily:null,last_weekly:null,last_monthly:null,crates:{common:0,advanced:0,premium:0},cosmetics:[],created_at:now()};this.saveProfiles(all);return structuredClone(all[id]);}
  update(uid,fn){const id=String(uid),all=this.profiles();all[id]??=this.profile(id);fn(all[id]);all[id].updated_at=now();this.saveProfiles(all);return structuredClone(all[id]);}
  addPoints(uid,n){return this.update(uid,p=>p.pro_points=Math.max(0,Number(p.pro_points||0)+Math.trunc(Number(n)||0)));}
  spendPoints(uid,n){const amount=Math.trunc(Number(n)||0);const p=this.profile(uid);if(amount<=0||p.pro_points<amount)return false;this.update(uid,x=>x.pro_points-=amount);return true;}
  addCrate(uid,type,n=1){return this.update(uid,p=>{p.crates??={common:0,advanced:0,premium:0};p.crates[type]=(p.crates[type]||0)+n;});}
  log(entry){const h=this.history();h.push({id:`pro_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,at:now(),...entry});JsonManager.save(HISTORY,h.slice(-5000));}
  grantEarned({userId,days,source,sourceId=null,details=null}){
    const uid=String(userId), d=Math.max(1,Math.trunc(Number(days)||1));
    const all=this.vip.load(); const current=all[uid]; const t=Date.now();
    let base=t;
    if(current?.active!==false && current?.expires_at){const old=new Date(current.expires_at).getTime();if(Number.isFinite(old)&&old>t)base=old;}
    // Pro permanente nunca é reduzido para temporário.
    if(current?.active!==false && current?.expires_at===null){this.log({user_id:uid,type:'earned_pro',days:d,source,source_id:sourceId,details,result:'already_permanent'});return current;}
    const entry={user_id:uid,tier:'pro',granted_by:'SYSTEM',granted_at:now(),expires_at:new Date(base+d*86400000).toISOString(),active:true,source};
    all[uid]=entry;this.vip.save(all);
    this.log({user_id:uid,type:'earned_pro',days:d,source,source_id:sourceId,details,expires_at:entry.expires_at});
    return structuredClone(entry);
  }
}

import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { DATA_DIR } from '../config/settings.js';
import { WalletManager } from '../economy/WalletManager.js';
import { ProPlayerManager } from './ProPlayerManager.js';
const CLAIMS=path.join(DATA_DIR,'pro','reward_claims.json');
const DAY=86400000;
const startOfWeek=d=>{const x=new Date(d);const day=(x.getUTCDay()+6)%7;x.setUTCDate(x.getUTCDate()-day);x.setUTCHours(0,0,0,0);return x.getTime();};
const monthKey=d=>`${d.getUTCFullYear()}-${d.getUTCMonth()+1}`;
export class ProRewardManager{
 constructor(){this.pro=new ProPlayerManager();this.wallet=new WalletManager();JsonManager.ensureFile(CLAIMS,{});}
 all(){return JsonManager.load(CLAIMS,{});} save(v){JsonManager.save(CLAIMS,v);}
 assert(uid){if(!this.pro.isPro(uid))throw new Error('Este recurso é exclusivo para Pro Players ativos.');}
 claim(uid,type){this.assert(uid);const id=String(uid),all=this.all();all[id]??={};const c=all[id],t=Date.now(),today=Math.floor(t/DAY),week=startOfWeek(t),month=monthKey(new Date(t));
   if(type==='daily'&&c.daily_day===today)throw new Error('Recompensa diária já coletada hoje.');
   if(type==='weekly'&&c.week===week)throw new Error('Recompensa semanal já coletada.');
   if(type==='monthly'&&c.month===month)throw new Error('Recompensa mensal já coletada.');
   let money=0,points=0,crate=null;
   if(type==='daily'){const yesterday=t-DAY;const streak=(c.last_daily_at&&t-c.last_daily_at<DAY*2.1)?Math.min(30,(c.streak||0)+1):1;c.streak=streak;c.daily_day=today;c.last_daily_at=t;money=1000+streak*100;points=50+streak*5;if(streak===7||streak===14)crate='common';if(streak===21)crate='advanced';if(streak===30)crate='premium';}
   else if(type==='weekly'){c.week=week;money=10000;points=500;crate='common';}
   else if(type==='monthly'){c.month=month;money=50000;points=2000;crate='premium';}
   else throw new Error('Tipo de recompensa inválido.');
   this.wallet.add(id,money);this.pro.addPoints(id,points);if(crate)this.pro.addCrate(id,crate,1);this.save(all);this.pro.log({user_id:id,type:`reward_${type}`,money,points,crate});return {money,points,crate,streak:c.streak||0};
 }
}

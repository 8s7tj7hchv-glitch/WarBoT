import fs from 'node:fs';
import path from 'node:path';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';
import { industrialStore } from '../storage/IndustrialStore.js';

const dataDir=process.env.TNT_DATA_DIR||'./data';
const file=path.join(dataDir,'military-factories','weekly_rewards.json');
function load(){ try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return{};} }
function save(v){ fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,JSON.stringify(v,null,2)); }
function weekKey(d=new Date()){ const x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())); const day=x.getUTCDay()||7; x.setUTCDate(x.getUTCDate()+4-day); const y=new Date(Date.UTC(x.getUTCFullYear(),0,1)); return `${x.getUTCFullYear()}-W${String(Math.ceil((((x-y)/86400000)+1)/7)).padStart(2,'0')}`; }
const REWARD={credits:5000,resources:{industrial_alloy:25,electronic_module:15,industrial_parts:20}};
export class WeeklyIndustrialRewardManager{
 status(userId){ const db=load(); const s=db[userId]||{}; const key=weekKey(); return {available:s.lastWeek!==key,lastWeek:s.lastWeek||null,reward:REWARD}; }
 claim(userId){ const db=load(); const key=weekKey(); const s=db[userId]||{}; if(s.lastWeek===key) throw new Error('Recompensa semanal já resgatada.');
  industrialEconomyManager.credit(userId,REWARD.credits,'Recompensa industrial semanal');
  for(const [item,qty] of Object.entries(REWARD.resources)) industrialStore.addResource(userId,item,qty);
  db[userId]={lastWeek:key,totalClaims:(s.totalClaims||0)+1,claimedAt:new Date().toISOString()}; save(db); return REWARD;
 }
}
export const weeklyIndustrialRewardManager=new WeeklyIndustrialRewardManager();

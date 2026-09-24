import fs from 'node:fs';
import path from 'node:path';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';
import { industrialStore } from '../storage/IndustrialStore.js';

const dataDir=process.env.TNT_DATA_DIR||'./data';
const file=path.join(dataDir,'military-factories','monthly_rewards.json');
function load(){ try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return{};} }
function save(v){ fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,JSON.stringify(v,null,2)); }
function monthKey(d=new Date()){ return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`; }
const REWARD={credits:20000,resources:{industrial_alloy:80,electronic_module:50,industrial_parts:70}};
export class MonthlyIndustrialRewardManager{
 status(userId){ const db=load(); const s=db[userId]||{}; const key=monthKey(); return {available:s.lastMonth!==key,lastMonth:s.lastMonth||null,totalClaims:s.totalClaims||0,reward:REWARD}; }
 claim(userId){ const db=load(); const key=monthKey(); const s=db[userId]||{}; if(s.lastMonth===key) throw new Error('Recompensa mensal já resgatada.');
  industrialEconomyManager.credit(userId,REWARD.credits,'Recompensa industrial mensal');
  for(const [item,qty] of Object.entries(REWARD.resources)) industrialStore.addResource(userId,item,qty);
  db[userId]={lastMonth:key,totalClaims:(s.totalClaims||0)+1,claimedAt:new Date().toISOString()}; save(db); return REWARD;
 }
}
export const monthlyIndustrialRewardManager=new MonthlyIndustrialRewardManager();

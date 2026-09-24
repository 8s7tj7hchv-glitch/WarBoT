import fs from 'node:fs';
import path from 'node:path';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';
import { industrialInventory } from '../inventory/IndustrialInventory.js';
const root=process.env.TNT_DATA_DIR||'./data';
const file=path.join(root,'military-factories','daily_rewards.json');
function ensureFile(){fs.mkdirSync(path.dirname(file),{recursive:true});if(!fs.existsSync(file))fs.writeFileSync(file,'{}\n');}
function load(){ensureFile();try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return {};}}
function save(v){ensureFile();const t=`${file}.tmp`;fs.writeFileSync(t,JSON.stringify(v,null,2));fs.renameSync(t,file);}
function dayKey(d=new Date()){return d.toISOString().slice(0,10);}
function previousDayKey(){const d=new Date();d.setUTCDate(d.getUTCDate()-1);return dayKey(d);}
const REWARDS=[
 {day:1,credits:1500,resources:{industrial_alloy:8}},
 {day:2,credits:2000,resources:{electronic_module:6}},
 {day:3,credits:2500,resources:{industrial_alloy:10,electronic_module:5}},
 {day:4,credits:3000,resources:{maintenance_kit:4}},
 {day:5,credits:4000,resources:{industrial_alloy:12,logistics_pack:4}},
 {day:6,credits:5000,resources:{electronic_module:10,maintenance_kit:5}},
 {day:7,credits:7500,resources:{industrial_alloy:20,electronic_module:12,maintenance_kit:6,logistics_pack:6}}
];
export class DailyIndustrialRewardManager{
 #data=load();
 ensure(userId){if(!this.#data[userId])this.#data[userId]={streak:0,lastClaim:null,totalClaims:0};return this.#data[userId];}
 status(userId){const s=this.ensure(userId);const today=dayKey();const canClaim=s.lastClaim!==today;const nextStreak=s.lastClaim===previousDayKey()?Math.min(7,s.streak+1):1;return {...structuredClone(s),canClaim,nextReward:REWARDS[nextStreak-1],nextStreak};}
 claim(userId){const s=this.ensure(userId);const today=dayKey();if(s.lastClaim===today)throw new Error('A recompensa industrial de hoje já foi resgatada.');s.streak=s.lastClaim===previousDayKey()?Math.min(7,s.streak+1):1;const reward=REWARDS[s.streak-1];industrialEconomyManager.credit(userId,reward.credits,{type:'daily_reward',description:`Recompensa industrial diária — dia ${s.streak}`});for(const [id,qty] of Object.entries(reward.resources))industrialInventory.addResource(userId,id,qty);s.lastClaim=today;s.totalClaims+=1;save(this.#data);return structuredClone(reward);}
}
export const dailyIndustrialRewardManager=new DailyIndustrialRewardManager();
export { REWARDS as DAILY_INDUSTRIAL_REWARDS };

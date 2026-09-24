import fs from 'node:fs';
import path from 'node:path';
const file=path.resolve(process.env.TNT_DATA_DIR||'data','military-factories','missions.json');
function load(){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return {};}}
function save(v){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(v,null,2));}
export const MISSION_CATALOG=Object.freeze([
 {id:'first_batch',emoji:'📦',name:'Primeiro Lote',goal:1,metric:'completed',reward:{xp:100,credits:500}},
 {id:'producer_10',emoji:'⚙️',name:'Linha Ativa',goal:10,metric:'completed',reward:{xp:300,credits:1500}},
 {id:'producer_50',emoji:'🏭',name:'Produtor Industrial',goal:50,metric:'completed',reward:{xp:800,credits:5000}},
 {id:'quality_80',emoji:'⭐',name:'Padrão de Qualidade',goal:80,metric:'quality',reward:{xp:400,credits:2000}},
 {id:'factory_level_10',emoji:'⬆️',name:'Fábrica Nível 10',goal:10,metric:'level',reward:{xp:600,credits:3500}},
 {id:'research_5',emoji:'🔬',name:'Pesquisa Avançada',goal:5,metric:'research',reward:{xp:700,credits:4000}}
]);
export class IndustrialMissionManager{
 profile(userId){const db=load();return db[userId]??{xp:0,credits:0,claimed:[]};}
 progress(userId,stats={}){const p=this.profile(userId);return MISSION_CATALOG.map(m=>({...m,value:Math.min(m.goal,Number(stats[m.metric]||0)),done:Number(stats[m.metric]||0)>=m.goal,claimed:p.claimed.includes(m.id)}));}
 claim(userId,missionId,stats={}){const m=this.progress(userId,stats).find(x=>x.id===missionId);if(!m)throw new Error('Missão inválida.');if(!m.done)throw new Error('Missão ainda não concluída.');if(m.claimed)throw new Error('Recompensa já resgatada.');const db=load();const p=db[userId]??{xp:0,credits:0,claimed:[]};p.xp+=m.reward.xp;p.credits+=m.reward.credits;p.claimed.push(m.id);db[userId]=p;save(db);return {mission:m,profile:p};}
}
export const industrialMissionManager=new IndustrialMissionManager();

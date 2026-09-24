import fs from 'node:fs';
import path from 'node:path';
import { getTechnology, technologyCost } from './TechnologyCatalog.js';
const file=()=>path.join(process.env.TNT_DATA_DIR||'./data','military-factories','research.json');
function load(){const f=file();fs.mkdirSync(path.dirname(f),{recursive:true});if(!fs.existsSync(f))fs.writeFileSync(f,'{}\n');try{return JSON.parse(fs.readFileSync(f,'utf8'));}catch{return {};}}
function save(v){const f=file(),t=`${f}.tmp`;fs.writeFileSync(t,JSON.stringify(v,null,2));fs.renameSync(t,f);}
function fresh(){return {points:100,levels:{ground:0,air:0,naval:0,industrial:0,strategic:0},history:[]};}
export class ResearchManager{
 get(userId){const db=load();return db[userId]??fresh();}
 ensure(userId){const db=load();if(!db[userId]){db[userId]=fresh();save(db);}return db[userId];}
 addPoints(userId,amount,source='game'){amount=Math.max(0,Math.floor(Number(amount)||0));const db=load();db[userId]??=fresh();db[userId].points+=amount;db[userId].history.push({type:'points',amount,source,at:new Date().toISOString()});save(db);return db[userId];}
 upgrade(userId,technologyId){const tech=getTechnology(technologyId);if(!tech)throw new Error('Tecnologia inválida.');const db=load();db[userId]??=fresh();const s=db[userId];const level=s.levels[technologyId]??0;if(level>=tech.maxLevel)throw new Error('Tecnologia já está no nível máximo.');const cost=technologyCost(tech,level);if(s.points<cost)throw new Error(`Pontos de pesquisa insuficientes. Necessário: ${cost}.`);s.points-=cost;s.levels[technologyId]=level+1;s.history.push({type:'upgrade',technologyId,level:level+1,cost,at:new Date().toISOString()});save(db);return {state:s,tech,cost};}
 bonuses(userId){const s=this.get(userId);return {productionEfficiency:Math.min(20,(s.levels.industrial||0)*2),groundEfficiency:(s.levels.ground||0)*2,airEfficiency:(s.levels.air||0)*2,navalEfficiency:(s.levels.naval||0)*2,strategicUnlockLevel:s.levels.strategic||0};}
}
export const researchManager=new ResearchManager();

import fs from 'node:fs';
import path from 'node:path';
const DATA_DIR=process.env.TNT_DATA_DIR||'./data';
const FILE=path.join(DATA_DIR,'military-factories','quality.json');
function read(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {batches:{}};}}
function write(v){fs.mkdirSync(path.dirname(FILE),{recursive:true});fs.writeFileSync(FILE,JSON.stringify(v,null,2));}
function grade(q){if(q>=95)return 'S';if(q>=88)return 'A';if(q>=78)return 'B';if(q>=65)return 'C';return 'D';}
export class QualityControlManager{
 register(ownerId,factoryId,job){const db=read();const key=String(ownerId);db.batches[key]??=[];const existing=db.batches[key].find(x=>x.jobId===job.id);if(existing)return existing;const batch={id:`batch_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,jobId:job.id,factoryId,itemId:job.itemId,quantity:job.quantity,quality:Math.max(0,Math.min(100,Number(job.quality)||0)),grade:grade(Number(job.quality)||0),technologyLevel:job.technology?.level??0,createdAt:new Date().toISOString()};db.batches[key].push(batch);write(db);return batch;}
 list(ownerId,limit=20){return (read().batches[String(ownerId)]||[]).slice(-limit).reverse();}
 summary(ownerId){const a=read().batches[String(ownerId)]||[];if(!a.length)return {batches:0,units:0,average:0,topGrade:'—'};const units=a.reduce((s,x)=>s+(x.quantity||0),0);const avg=Math.round(a.reduce((s,x)=>s+(x.quality||0),0)/a.length);return {batches:a.length,units,average:avg,topGrade:grade(avg)};}
}
export const qualityControlManager=new QualityControlManager();

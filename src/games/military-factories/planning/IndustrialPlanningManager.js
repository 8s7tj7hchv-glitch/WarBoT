import fs from 'node:fs';
import path from 'node:path';
import { factoryManager } from '../core/FactoryManager.js';
import { getFactory } from '../core/FactoryRegistry.js';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';

const root=process.env.TNT_DATA_DIR||'./data';
const file=path.join(root,'military-factories','production_plans.json');
function ensureFile(){fs.mkdirSync(path.dirname(file),{recursive:true});if(!fs.existsSync(file))fs.writeFileSync(file,'{}\n');}
function load(){ensureFile();try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return {};}}
function save(v){ensureFile();const t=`${file}.tmp`;fs.writeFileSync(t,JSON.stringify(v,null,2));fs.renameSync(t,file);}
function now(){return new Date().toISOString();}

export class IndustrialPlanningManager{
 #data=load();
 key(ownerId,factoryId){return `${ownerId}:${factoryId}`;}
 get(ownerId,factoryId){return this.#data[this.key(ownerId,factoryId)]??null;}
 create(ownerId,factoryId){
  if(!getFactory(factoryId)) throw new Error('Fábrica inválida.');
  const current=this.get(ownerId,factoryId);
  if(current?.status==='active') return current;
  const f=factoryManager.ensure(ownerId,factoryId);
  const target=Math.min(25,5+(Math.floor((f.level-1)/5)*5));
  const reward=target*750;
  const plan={id:`PLAN-${Date.now().toString(36).toUpperCase()}`,ownerId,factoryId,status:'active',baselineCompleted:f.completed,target,reward,createdAt:now(),claimedAt:null};
  this.#data[this.key(ownerId,factoryId)]=plan;save(this.#data);return plan;
 }
 progress(ownerId,factoryId){
  const plan=this.get(ownerId,factoryId);if(!plan)return null;
  const f=factoryManager.ensure(ownerId,factoryId);
  const done=Math.max(0,f.completed-plan.baselineCompleted);
  return {...plan,done:Math.min(done,plan.target),percent:Math.min(100,Math.floor((done/plan.target)*100)),ready:done>=plan.target};
 }
 claim(ownerId,factoryId){
  const plan=this.progress(ownerId,factoryId);if(!plan)throw new Error('Nenhum plano industrial ativo.');
  if(plan.status!=='active')throw new Error('Plano já encerrado.');
  if(!plan.ready)throw new Error('Meta industrial ainda não foi concluída.');
  const stored=this.#data[this.key(ownerId,factoryId)];stored.status='completed';stored.claimedAt=now();save(this.#data);
  industrialEconomyManager.credit(ownerId,stored.reward,{type:'planning_reward',description:`Meta industrial concluída: ${factoryId}`,reference:stored.id});
  return stored.reward;
 }
 cancel(ownerId,factoryId){const p=this.get(ownerId,factoryId);if(!p||p.status!=='active')return false;p.status='cancelled';p.cancelledAt=now();save(this.#data);return true;}
 list(ownerId){return Object.values(this.#data).filter(x=>x.ownerId===ownerId).map(x=>this.progress(ownerId,x.factoryId)??x);}
}
export const industrialPlanningManager=new IndustrialPlanningManager();

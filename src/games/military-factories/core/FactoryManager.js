import { getFactory } from './FactoryRegistry.js';
import { loadFactoryState, saveFactoryState } from '../storage/FactoryStore.js';

const MAX_LEVEL=25;
export class FactoryManager {
 constructor(){ this.state=loadFactoryState(); }
 key(ownerId,factoryId){ return `${ownerId}:${factoryId}`; }
 ensure(ownerId,factoryId){
  if(!getFactory(factoryId)) throw new Error('Fábrica inválida.');
  const key=this.key(ownerId,factoryId);
  if(!this.state[key]) { this.state[key]={ownerId,factoryId,level:1,efficiency:100,capacity:2,queue:[],completed:0,createdAt:new Date().toISOString()}; this.persist(); }
  return this.state[key];
 }
 persist(){ saveFactoryState(this.state); }
 levelUp(ownerId,factoryId){ const f=this.ensure(ownerId,factoryId); if(f.level>=MAX_LEVEL) return f; f.level++; f.capacity=2+Math.floor(f.level/2); f.efficiency=Math.min(150,100+((f.level-1)*2)); this.persist(); return f; }
 enqueue(ownerId,factoryId,itemId,quantity=1){
  const f=this.ensure(ownerId,factoryId); quantity=Math.max(1,Math.floor(Number(quantity)||1));
  if(f.queue.filter(x=>x.status==='queued'||x.status==='running').length>=f.capacity) throw new Error('Fila de produção cheia.');
  const job={id:`JOB-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,itemId,quantity,status:'queued',progress:0,createdAt:new Date().toISOString()}; f.queue.push(job); this.persist(); return job;
 }
 startNext(ownerId,factoryId){ const f=this.ensure(ownerId,factoryId); const job=f.queue.find(x=>x.status==='queued'); if(job){ job.status='running'; job.startedAt=new Date().toISOString(); this.persist(); } return job??null; }
 complete(ownerId,factoryId,jobId){ const f=this.ensure(ownerId,factoryId); const job=f.queue.find(x=>x.id===jobId); if(!job) throw new Error('Produção não encontrada.'); job.status='completed'; job.progress=100; job.completedAt=new Date().toISOString(); f.completed++; this.persist(); return job; }
 list(ownerId){ return Object.values(this.state).filter(x=>x.ownerId===ownerId); }
}
export const factoryManager=new FactoryManager();

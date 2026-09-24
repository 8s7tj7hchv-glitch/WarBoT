import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.env.TNT_DATA_DIR||'./data';
const file=path.join(root,'military-factories','contracts.json');
function ensure(){fs.mkdirSync(path.dirname(file),{recursive:true});if(!fs.existsSync(file))fs.writeFileSync(file,'{}\n');}
function load(){ensure();try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return {};}}
function save(v){ensure();const t=`${file}.tmp`;fs.writeFileSync(t,JSON.stringify(v,null,2));fs.renameSync(t,file);}
function now(){return new Date().toISOString();}

export class MilitaryContractManager {
  #data=load();
  list(ownerId){return [...(this.#data[ownerId]||[])].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
  create(ownerId,{countryId='local',factoryId,itemId,quantity=1,reward=0,source='world-war'}={}){
    if(!factoryId||!itemId) throw new Error('Fábrica e produto são obrigatórios.');
    quantity=Math.max(1,Math.floor(Number(quantity)||1));
    const contract={id:`MC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,countryId:String(countryId),factoryId:String(factoryId),itemId:String(itemId),quantity,reward:Math.max(0,Number(reward)||0),rewardPaid:false,rewardPaidAt:null,source,status:'open',createdAt:now(),acceptedAt:null,completedAt:null,productionJobId:null};
    (this.#data[ownerId]??=[]).push(contract);save(this.#data);return contract;
  }
  get(ownerId,id){return (this.#data[ownerId]||[]).find(x=>x.id===id)||null;}
  accept(ownerId,id){const c=this.get(ownerId,id);if(!c)throw new Error('Contrato não encontrado.');if(c.status!=='open')throw new Error('Contrato não está disponível.');c.status='accepted';c.acceptedAt=now();save(this.#data);return c;}
  attachProduction(ownerId,id,jobId){const c=this.get(ownerId,id);if(!c)throw new Error('Contrato não encontrado.');c.productionJobId=jobId;c.status='production';save(this.#data);return c;}
  ready(ownerId,id){const c=this.get(ownerId,id);if(!c)throw new Error('Contrato não encontrado.');c.status='ready';save(this.#data);return c;}
  complete(ownerId,id,deliveryId=null){const c=this.get(ownerId,id);if(!c)throw new Error('Contrato não encontrado.');c.status='completed';c.completedAt=now();c.deliveryId=deliveryId;save(this.#data);return c;}
  cancel(ownerId,id){const c=this.get(ownerId,id);if(!c)throw new Error('Contrato não encontrado.');if(c.status==='completed')throw new Error('Contrato já concluído.');c.status='cancelled';c.cancelledAt=now();save(this.#data);return c;}
  persist(){save(this.#data);}
  stats(ownerId){const a=this.list(ownerId);return {total:a.length,open:a.filter(x=>x.status==='open').length,active:a.filter(x=>['accepted','production','ready'].includes(x.status)).length,completed:a.filter(x=>x.status==='completed').length};}
}
export const militaryContractManager=new MilitaryContractManager();

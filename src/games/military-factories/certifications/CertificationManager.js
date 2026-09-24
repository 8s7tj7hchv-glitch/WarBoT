import { factoryManager } from '../core/FactoryManager.js';
import { qualityControlManager } from '../quality/QualityControlManager.js';

const TIERS = Object.freeze([
  { id:'basic', name:'Certificada', emoji:'🥉', minCompleted:5, minQuality:65 },
  { id:'advanced', name:'Avançada', emoji:'🥈', minCompleted:20, minQuality:78 },
  { id:'elite', name:'Elite', emoji:'🥇', minCompleted:50, minQuality:88 },
  { id:'master', name:'Mestre Industrial', emoji:'🏆', minCompleted:100, minQuality:95 }
]);

export class CertificationManager {
 status(ownerId,factoryId){
  const factory=factoryManager.ensure(ownerId,factoryId);
  const batches=qualityControlManager.list(ownerId,10000).filter(x=>x.factoryId===factoryId);
  const average=batches.length?Math.round(batches.reduce((s,x)=>s+(Number(x.quality)||0),0)/batches.length):0;
  const completed=Number(factory.completed)||0;
  let current=null;
  for(const tier of TIERS){ if(completed>=tier.minCompleted && average>=tier.minQuality) current=tier; }
  const next=TIERS.find(t=>!current || TIERS.indexOf(t)>TIERS.indexOf(current)) ?? null;
  return {current,next,completed,average,batches:batches.length};
 }
 tiers(){ return TIERS; }
}
export const certificationManager=new CertificationManager();

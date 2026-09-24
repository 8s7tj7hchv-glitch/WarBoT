import { factoryManager } from '../core/FactoryManager.js';
import { getCatalogItem } from './CatalogService.js';
import { industrialInventory } from '../inventory/IndustrialInventory.js';
import { productionCost } from './ProductionEconomy.js';
import { energyManager } from '../energy/EnergyManager.js';
import { workforceManager } from '../workforce/WorkforceManager.js';
import { factoryMaintenanceManager } from '../maintenance/FactoryMaintenanceManager.js';
import { technologyIntegrationService } from '../research/TechnologyIntegrationService.js';
import { qualityControlManager } from '../quality/QualityControlManager.js';
import { industrialEventManager } from '../events/IndustrialEventManager.js';

function energyCost(factoryId, quantity){
  const strategic = ['missile-systems','strategic','aviation','shipyard'].includes(factoryId);
  return Math.max(1, Math.ceil(quantity * (strategic ? 18 : 10)));
}
export class ProductionService {
 create(ownerId,factoryId,itemId,quantity=1){
  const item=getCatalogItem(factoryId,itemId); if(!item) throw new Error('Produto inválido para esta fábrica.');
  const technology=technologyIntegrationService.assertUnlocked(ownerId,factoryId,item);
  quantity=Math.max(1,Math.floor(Number(quantity)||1));
  if(workforceManager.capacity(ownerId)<1) throw new Error('Capacidade de mão de obra insuficiente.');
  const cost=productionCost(factoryId,quantity); const energy=industrialEventManager.applyEnergy(energyCost(factoryId,quantity));
  industrialInventory.consume(ownerId,cost);
  try { energyManager.consume(ownerId,energy); }
  catch(err){ for(const [id,q] of Object.entries(cost)) industrialInventory.addResource(ownerId,id,q); throw err; }
  const job=factoryManager.enqueue(ownerId,factoryId,itemId,quantity); job.cost=cost; job.energyCost=energy; job.productivity=workforceManager.productivity(ownerId); job.technology=technology; job.researchBonus=technologyIntegrationService.productionModifier(ownerId,factoryId); factoryManager.persist(); return job;
 }
 start(ownerId,factoryId){return factoryManager.startNext(ownerId,factoryId);}
 complete(ownerId,factoryId,jobId){const job=factoryManager.complete(ownerId,factoryId,jobId);if(!job.stockCredited){const factor=factoryMaintenanceManager.efficiencyFactor(ownerId,factoryId);job.quality=industrialEventManager.applyQuality(Math.max(50,Math.min(100,Math.round(70+(factor*20)+(Math.min(10,job.productivity||0))+(Math.min(10,(job.researchBonus||0)/2))))));industrialInventory.addStock(ownerId,job.itemId,job.quantity);job.stockCredited=true;job.qualityBatch=qualityControlManager.register(ownerId,factoryId,job);workforceManager.addXp(ownerId,job.quantity*industrialEventManager.xpMultiplier());factoryMaintenanceManager.wear(ownerId,factoryId,Math.max(1,Math.ceil(job.quantity/2)));factoryManager.persist();}return job;}
 cancel(ownerId,factoryId,jobId){const f=factoryManager.ensure(ownerId,factoryId);const job=f.queue.find(x=>x.id===jobId);if(!job)throw new Error('Produção não encontrada.');if(job.status==='completed')throw new Error('Produção já concluída.');if(job.status==='cancelled')return job;job.status='cancelled';job.cancelledAt=new Date().toISOString();for(const [id,q] of Object.entries(job.cost||{}))industrialInventory.addResource(ownerId,id,q);energyManager.restore(ownerId,job.energyCost||0);factoryManager.persist();return job;}
}
export const productionService=new ProductionService();

import { militaryContractManager } from './MilitaryContractManager.js';
import { productionService } from '../production/ProductionService.js';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';
export class ContractProductionService {
 acceptAndQueue(ownerId,contractId){
  const c=militaryContractManager.accept(ownerId,contractId);
  try { const job=productionService.create(ownerId,c.factoryId,c.itemId,c.quantity); militaryContractManager.attachProduction(ownerId,c.id,job.id); return {contract:c,job}; }
  catch(err){ c.status='open'; throw err; }
 }
 markReady(ownerId,contractId){return militaryContractManager.ready(ownerId,contractId);}
 complete(ownerId,contractId,deliveryId=null){const c=militaryContractManager.complete(ownerId,contractId,deliveryId);const paid=industrialEconomyManager.contractReward(ownerId,c);militaryContractManager.persist?.();return {...c,paidReward:paid};}
}
export const contractProductionService=new ContractProductionService();

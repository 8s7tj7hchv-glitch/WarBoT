import { researchManager } from './ResearchManager.js';

const FACTORY_TECH = Object.freeze({
  vehicles: 'ground', armored: 'ground', aviation: 'air', shipyard: 'naval',
  'missile-systems': 'strategic', strategic: 'strategic', electronics: 'industrial',
  components: 'industrial', 'heavy-equipment': 'industrial', logistics: 'industrial',
  maintenance: 'industrial', research: 'industrial'
});

function requiredLevel(item={}) {
  if (Number.isInteger(item.requiredTechLevel)) return Math.max(0,item.requiredTechLevel);
  const tier = Number(item.tier ?? item.level ?? 1);
  return Math.max(0, Math.min(10, Math.floor((tier - 1) / 2)));
}

export class TechnologyIntegrationService {
 areaForFactory(factoryId){ return FACTORY_TECH[factoryId] ?? 'industrial'; }
 requirement(factoryId,item={}){
  return { area:this.areaForFactory(factoryId), level:requiredLevel(item) };
 }
 check(userId,factoryId,item={}){
  const req=this.requirement(factoryId,item); const state=researchManager.get(userId);
  const current=state.levels?.[req.area] ?? 0;
  return { unlocked:current>=req.level, current, ...req };
 }
 assertUnlocked(userId,factoryId,item={}){
  const result=this.check(userId,factoryId,item);
  if(!result.unlocked) throw new Error(`Tecnologia insuficiente: ${result.area} nível ${result.level} necessário (atual ${result.current}).`);
  return result;
 }
 productionModifier(userId,factoryId){
  const b=researchManager.bonuses(userId); let bonus=b.productionEfficiency||0;
  if(['vehicles','armored'].includes(factoryId)) bonus+=b.groundEfficiency||0;
  if(factoryId==='aviation') bonus+=b.airEfficiency||0;
  if(factoryId==='shipyard') bonus+=b.navalEfficiency||0;
  return Math.min(35,bonus);
 }
}
export const technologyIntegrationService=new TechnologyIntegrationService();

import { FACTORIES } from '../core/FactoryRegistry.js';
import { factoryManager } from '../core/FactoryManager.js';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';
import { researchManager } from '../research/ResearchManager.js';

function safe(fn, fallback){ try { return fn(); } catch { return fallback; } }

class IndustrialStatisticsManager {
 snapshot(userId){
  const factories=safe(()=>factoryManager.list(userId),[])||[];
  const totalLevel=factories.reduce((n,f)=>n+(Number(f.level)||0),0);
  const completed=factories.reduce((n,f)=>n+(Number(f.completed)||0),0);
  const active=factories.reduce((n,f)=>n+((f.queue||[]).filter(x=>x.status!=='completed').length),0);
  const initialized=factories.length;
  const averageLevel=initialized ? totalLevel/initialized : 0;
  const research=safe(()=>researchManager.getAll?.(userId),null);
  let researchLevels=0;
  if(Array.isArray(research)) researchLevels=research.reduce((n,x)=>n+(Number(x.level)||0),0);
  else if(research&&typeof research==='object') researchLevels=Object.values(research).reduce((n,x)=>n+(Number(x?.level??x)||0),0);
  const economy=safe(()=>industrialEconomyManager.summary?.(userId),null)||safe(()=>industrialEconomyManager.get?.(userId),{})||{};
  return {
   factoriesAvailable: FACTORIES.length,
   initialized,
   totalLevel,
   averageLevel,
   completed,
   active,
   researchLevels,
   balance:Number(economy.balance??economy.credits??0)||0,
   received:Number(economy.totalReceived??0)||0,
   spent:Number(economy.totalSpent??0)||0
  };
 }
 factoryBreakdown(userId){
  return FACTORIES.map(meta=>{
   const f=safe(()=>factoryManager.ensure(userId,meta.id),{});
   return {id:meta.id,name:meta.name,emoji:meta.emoji,level:Number(f.level)||1,completed:Number(f.completed)||0,active:(f.queue||[]).filter(x=>x.status!=='completed').length};
  });
 }
}
export const industrialStatisticsManager=new IndustrialStatisticsManager();

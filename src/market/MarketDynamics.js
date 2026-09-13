import { ItemRegistry } from '../core/ItemRegistry.js';
import { MarketAnalytics } from './MarketAnalytics.js';
import { MarketOrderManager } from './MarketOrderManager.js';
import { MarketScarcityManager } from './MarketScarcityManager.js';
import { MarketIndexManager } from './MarketIndexManager.js';
import { MARKET_DYNAMIC_MIN_MULTIPLIER,MARKET_DYNAMIC_MAX_MULTIPLIER,MARKET_DEMAND_WEIGHT,MARKET_SUPPLY_WEIGHT,MARKET_SCARCITY_WEIGHT,MARKET_MOMENTUM_WEIGHT } from '../config/settings.js';
export class MarketDynamics {
 constructor(){this.items=new ItemRegistry();this.analytics=new MarketAnalytics();this.orders=new MarketOrderManager();this.scarcity=new MarketScarcityManager(this.orders);this.indexes=new MarketIndexManager();}
 demandIndex(itemId){const b=this.orders.listBuy(itemId).reduce((s,o)=>s+Number(o.remaining||0),0),a=this.orders.listSell(itemId).reduce((s,o)=>s+Number(o.remaining||0),0),t=a+b;return t<=0?.5:Math.max(0,Math.min(1,b/t));}
 supplyIndex(itemId){return 1-this.demandIndex(itemId);}
 momentumIndex(itemId){const s=this.analytics.itemStats(itemId,24); return Math.max(0,Math.min(1,.5+(Number(s.change_percent||0)/100)/2));}
 calculatePressure(itemId){const demand=this.demandIndex(itemId),supply=this.supplyIndex(itemId),scarcity=this.scarcity.calculate(itemId).index,momentum=this.momentumIndex(itemId); const pressure=.5+(demand-.5)*MARKET_DEMAND_WEIGHT-(supply-.5)*MARKET_SUPPLY_WEIGHT+(scarcity-.5)*MARKET_SCARCITY_WEIGHT+(momentum-.5)*MARKET_MOMENTUM_WEIGHT; const result={demand:+demand.toFixed(4),supply:+supply.toFixed(4),scarcity:+scarcity.toFixed(4),momentum:+momentum.toFixed(4),pressure:+Math.max(0,Math.min(1,pressure)).toFixed(4)}; this.indexes.saveIndex(itemId,result);return result;}
 calculateMultiplier(itemId){const p=this.calculatePressure(itemId).pressure; const raw=1+(p-.5)*2; return +Math.max(MARKET_DYNAMIC_MIN_MULTIPLIER,Math.min(MARKET_DYNAMIC_MAX_MULTIPLIER,raw)).toFixed(4);}
 referencePrice(itemId){const base=Number(this.items.getBasePrice(itemId)); const stats=this.analytics.itemStats(itemId,24); const anchor=stats.trades>0?stats.average:base; return +(anchor*this.calculateMultiplier(itemId)).toFixed(2);}
 classifyPressure(itemId){const p=this.calculatePressure(itemId).pressure; return p>=.8?'forte_alta':p>=.6?'alta':p>=.4?'equilibrado':p>=.2?'baixa':'forte_baixa';}
}

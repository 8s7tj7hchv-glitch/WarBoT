import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MARKET_DATA_DIR } from '../config/settings.js';
import { MarketOrderManager } from './MarketOrderManager.js';
const FILE=path.join(MARKET_DATA_DIR,'scarcity.json');
export class MarketScarcityManager {
  constructor(orders=new MarketOrderManager()){ this.orders=orders; JsonManager.ensureFile(FILE,{}); }
  availableSupply(itemId){ return this.orders.listSell(itemId).reduce((s,o)=>s+Math.trunc(Number(o.remaining??0)),0); }
  openDemand(itemId){ return this.orders.listBuy(itemId).reduce((s,o)=>s+Math.trunc(Number(o.remaining??0)),0); }
  calculate(itemId){ const supply=this.availableSupply(itemId), demand=this.openDemand(itemId), total=supply+demand; const index=total<=0?.5:demand/total; const status=index>=.85?'crítico':index>=.70?'muito_escasso':index>=.60?'escasso':index>=.40?'equilibrado':index>=.25?'abundante':'muito_abundante'; const result={supply,demand,index:Math.round(index*10000)/10000,status}; const data=JsonManager.load(FILE,{}); data[itemId]=result; JsonManager.save(FILE,data); return result; }
}

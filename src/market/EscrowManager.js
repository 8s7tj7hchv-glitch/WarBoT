import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MARKET_DATA_DIR } from '../config/settings.js';
const FILE = path.join(MARKET_DATA_DIR, 'escrow.json');
const clone = v => structuredClone(v);
export class EscrowManager {
  constructor(){ JsonManager.ensureFile(FILE,{money:{},items:{}}); }
  load(){ const d=JsonManager.load(FILE,{money:{},items:{}}); return d && typeof d==='object' && !Array.isArray(d) ? {money:d.money??{},items:d.items??{}} : {money:{},items:{}}; }
  save(d){ JsonManager.save(FILE,d); }
  reserveMoney(orderId,userId,amount){ const d=this.load(); d.money[orderId]={order_id:orderId,user_id:String(userId),amount:Math.round(Number(amount)*100)/100}; this.save(d); return clone(d.money[orderId]); }
  getMoney(orderId){ return clone(this.load().money[orderId]??null); }
  releaseMoney(orderId){ const d=this.load(); const v=d.money[orderId]??null; delete d.money[orderId]; this.save(d); return clone(v); }
  updateMoney(orderId,amount){ const d=this.load(); if(!d.money[orderId]) return null; d.money[orderId].amount=Math.max(0,Math.round(Number(amount)*100)/100); this.save(d); return clone(d.money[orderId]); }
  reserveItem(orderId,userId,itemId,quantity,quality=50){ const d=this.load(); d.items[orderId]={order_id:orderId,user_id:String(userId),item_id:String(itemId),quantity:Math.trunc(quantity),quality:Math.trunc(quality)}; this.save(d); return clone(d.items[orderId]); }
  getItem(orderId){ return clone(this.load().items[orderId]??null); }
  releaseItem(orderId){ const d=this.load(); const v=d.items[orderId]??null; delete d.items[orderId]; this.save(d); return clone(v); }
  updateItemQuantity(orderId,quantity){ const d=this.load(); if(!d.items[orderId]) return null; d.items[orderId].quantity=Math.max(0,Math.trunc(quantity)); if(d.items[orderId].quantity===0) delete d.items[orderId]; this.save(d); return clone(d.items[orderId]??null); }
}

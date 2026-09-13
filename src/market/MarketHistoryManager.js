import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { MARKET_DATA_DIR } from '../config/settings.js';
const FILE=path.join(MARKET_DATA_DIR,'history.json');
const clone=v=>structuredClone(v);
export class MarketHistoryManager {
  constructor(){ JsonManager.ensureFile(FILE,[]); }
  load(){ const d=JsonManager.load(FILE,[]); return Array.isArray(d)?d:[]; }
  registerTrade(data){ const all=this.load(); const trade={id:randomUUID().replaceAll('-',''),created_at:new Date().toISOString(),...clone(data)}; all.push(trade); JsonManager.save(FILE,all); return clone(trade); }
  getItemHistory(itemId,limit=50){ return this.load().filter(t=>t.item_id===itemId).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).slice(0,limit).map(clone); }
  getUserHistory(userId,limit=50){ const id=String(userId); return this.load().filter(t=>String(t.buyer_id)===id||String(t.seller_id)===id).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).slice(0,limit).map(clone); }
  listAll(){ return this.load().map(clone); }
  count(){ return this.load().length; }
}

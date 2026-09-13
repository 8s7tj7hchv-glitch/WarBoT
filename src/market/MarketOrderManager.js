import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { MARKET_DATA_DIR } from '../config/settings.js';

const SELL = path.join(MARKET_DATA_DIR, 'sell_orders.json');
const BUY = path.join(MARKET_DATA_DIR, 'buy_orders.json');
const clone = (v) => structuredClone(v);

export class MarketOrderManager {
  constructor() {
    JsonManager.ensureFile(SELL, []);
    JsonManager.ensureFile(BUY, []);
  }
  now() { return new Date().toISOString(); }
  load(file) { const d = JsonManager.load(file, []); return Array.isArray(d) ? d : []; }
  save(file, data) { JsonManager.save(file, data); }
  createSell(sellerId, itemId, quantity, unitPrice, quality = 50) {
    const data = this.load(SELL);
    const order = { id: randomUUID().replaceAll('-', ''), type: 'sell', seller_id: String(sellerId), item_id: String(itemId), quantity: Math.trunc(quantity), remaining: Math.trunc(quantity), unit_price: Math.round(Number(unitPrice) * 100) / 100, quality: Math.trunc(quality), status: 'open', created_at: this.now() };
    data.push(order); this.save(SELL, data); return clone(order);
  }
  createBuy(buyerId, itemId, quantity, unitPrice) {
    const data = this.load(BUY);
    const order = { id: randomUUID().replaceAll('-', ''), type: 'buy', buyer_id: String(buyerId), item_id: String(itemId), quantity: Math.trunc(quantity), remaining: Math.trunc(quantity), unit_price: Math.round(Number(unitPrice) * 100) / 100, status: 'open', created_at: this.now() };
    data.push(order); this.save(BUY, data); return clone(order);
  }
  listSell(itemId = null) { return this.load(SELL).filter(o => o.status === 'open' && (!itemId || o.item_id === itemId)).sort((a,b)=>Number(a.unit_price)-Number(b.unit_price) || String(a.created_at).localeCompare(String(b.created_at))); }
  listBuy(itemId = null) { return this.load(BUY).filter(o => o.status === 'open' && (!itemId || o.item_id === itemId)).sort((a,b)=>Number(b.unit_price)-Number(a.unit_price) || String(a.created_at).localeCompare(String(b.created_at))); }
  getSell(id) { return clone(this.load(SELL).find(o => o.id === id) ?? null); }
  getBuy(id) { return clone(this.load(BUY).find(o => o.id === id) ?? null); }
  updateOrder(type, id, changes) {
    const file = type === 'sell' ? SELL : BUY; const data = this.load(file); const index = data.findIndex(o=>o.id===id); if(index<0) return null;
    data[index] = { ...data[index], ...clone(changes) }; this.save(file, data); return clone(data[index]);
  }
}

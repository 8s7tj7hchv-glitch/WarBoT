import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { MARKET_DATA_DIR } from '../config/settings.js';

const SELL = path.join(MARKET_DATA_DIR, 'international_sell_orders.json');
const BUY = path.join(MARKET_DATA_DIR, 'international_buy_orders.json');
const clone = (value) => structuredClone(value);
const money = (value) => Math.round(Number(value) * 100) / 100;

export class InternationalOrderManager {
  constructor() {
    JsonManager.ensureFile(SELL, []);
    JsonManager.ensureFile(BUY, []);
  }

  now() { return new Date().toISOString(); }
  load(file) { const data = JsonManager.load(file, []); return Array.isArray(data) ? data : []; }
  save(file, data) { JsonManager.save(file, data); }

  createSell({ sellerId, guildId, guildName, itemId, quantity, unitPrice, quality = 50 }) {
    const data = this.load(SELL);
    const order = {
      id: randomUUID().replaceAll('-', ''),
      scope: 'international',
      type: 'sell',
      seller_id: String(sellerId),
      origin_guild_id: String(guildId),
      origin_guild_name: String(guildName || 'Servidor').slice(0, 100),
      item_id: String(itemId),
      quantity: Math.trunc(Number(quantity)),
      remaining: Math.trunc(Number(quantity)),
      unit_price: money(unitPrice),
      quality: Math.trunc(Number(quality || 50)),
      status: 'open',
      created_at: this.now()
    };
    data.push(order);
    this.save(SELL, data);
    return clone(order);
  }

  createBuy({ buyerId, guildId, guildName, itemId, quantity, unitPrice }) {
    const data = this.load(BUY);
    const order = {
      id: randomUUID().replaceAll('-', ''),
      scope: 'international',
      type: 'buy',
      buyer_id: String(buyerId),
      destination_guild_id: String(guildId),
      destination_guild_name: String(guildName || 'Servidor').slice(0, 100),
      item_id: String(itemId),
      quantity: Math.trunc(Number(quantity)),
      remaining: Math.trunc(Number(quantity)),
      unit_price: money(unitPrice),
      status: 'open',
      created_at: this.now()
    };
    data.push(order);
    this.save(BUY, data);
    return clone(order);
  }

  listSell(itemId = null) {
    return this.load(SELL)
      .filter((o) => o.status === 'open' && (!itemId || o.item_id === itemId))
      .sort((a, b) => Number(a.unit_price) - Number(b.unit_price) || String(a.created_at).localeCompare(String(b.created_at)))
      .map(clone);
  }

  listBuy(itemId = null) {
    return this.load(BUY)
      .filter((o) => o.status === 'open' && (!itemId || o.item_id === itemId))
      .sort((a, b) => Number(b.unit_price) - Number(a.unit_price) || String(a.created_at).localeCompare(String(b.created_at)))
      .map(clone);
  }

  getSell(id) { return clone(this.load(SELL).find((o) => o.id === String(id)) ?? null); }
  getBuy(id) { return clone(this.load(BUY).find((o) => o.id === String(id)) ?? null); }

  updateOrder(type, id, changes) {
    const file = type === 'sell' ? SELL : BUY;
    const data = this.load(file);
    const index = data.findIndex((o) => o.id === String(id));
    if (index < 0) return null;
    data[index] = { ...data[index], ...clone(changes) };
    this.save(file, data);
    return clone(data[index]);
  }

  listUser(userId) {
    const id = String(userId);
    return [
      ...this.load(SELL).filter((o) => o.seller_id === id),
      ...this.load(BUY).filter((o) => o.buyer_id === id)
    ].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).map(clone);
  }
}

import { MarketOrderManager } from './MarketOrderManager.js';
import { InternationalOrderManager } from './InternationalOrderManager.js';
import { EscrowManager } from './EscrowManager.js';
import { LogisticsManager } from './LogisticsManager.js';
import { MarketHistoryManager } from './MarketHistoryManager.js';

const money = v => Math.round(Number(v) * 100) / 100;

export class MarketIntegrityManager {
  constructor() {
    this.localOrders = new MarketOrderManager();
    this.internationalOrders = new InternationalOrderManager();
    this.escrow = new EscrowManager();
    this.logistics = new LogisticsManager();
    this.history = new MarketHistoryManager();
  }

  audit() {
    const issues = [];
    const checkBook = (scope, orders) => {
      for (const o of orders.listSell()) {
        if (o.status !== 'open') continue;
        const e = this.escrow.getItem(o.id);
        if (!e) issues.push({ scope, code: 'SELL_ESCROW_MISSING', order_id: o.id });
        else if (Number(e.quantity) < Number(o.remaining)) issues.push({ scope, code: 'SELL_ESCROW_SHORT', order_id: o.id, expected: Number(o.remaining), actual: Number(e.quantity) });
      }
      for (const o of orders.listBuy()) {
        if (o.status !== 'open') continue;
        const e = this.escrow.getMoney(o.id);
        const minimum = money(Number(o.remaining) * Number(o.unit_price));
        if (!e) issues.push({ scope, code: 'BUY_ESCROW_MISSING', order_id: o.id });
        else if (money(e.amount) < minimum) issues.push({ scope, code: 'BUY_ESCROW_SHORT', order_id: o.id, expected_minimum: minimum, actual: money(e.amount) });
      }
    };

    checkBook('local', this.localOrders);
    checkBook('international', this.internationalOrders);

    const trades = new Map(this.history.listAll().map(t => [String(t.id), t]));
    for (const s of this.logistics.load()) {
      if (!trades.has(String(s.trade_id))) issues.push({ scope: String(s.market_scope ?? 'local'), code: 'SHIPMENT_TRADE_MISSING', shipment_id: s.id, trade_id: s.trade_id });
      if (s.status === 'in_transit' && !s.carrier_id) issues.push({ scope: String(s.market_scope ?? 'local'), code: 'SHIPMENT_CARRIER_MISSING', shipment_id: s.id });
      if (s.status === 'delivered' && !s.delivered_at) issues.push({ scope: String(s.market_scope ?? 'local'), code: 'SHIPMENT_DELIVERY_TIMESTAMP_MISSING', shipment_id: s.id });
    }

    return { ok: issues.length === 0, issues, checked_at: new Date().toISOString() };
  }
}

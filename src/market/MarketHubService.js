import { MarketManager } from './MarketManager.js';
import { InternationalMarketManager } from './InternationalMarketManager.js';
import { MarketOrderManager } from './MarketOrderManager.js';
import { InternationalOrderManager } from './InternationalOrderManager.js';
import { LogisticsManager } from './LogisticsManager.js';
import { MarketHistoryManager } from './MarketHistoryManager.js';
import { MarketPricing } from './MarketPricing.js';
import { GuildMarketRegistry } from './GuildMarketRegistry.js';

export class MarketHubService {
  constructor() {
    this.local = new MarketManager();
    this.international = new InternationalMarketManager();
    this.localOrders = new MarketOrderManager();
    this.internationalOrders = new InternationalOrderManager();
    this.logistics = new LogisticsManager();
    this.history = new MarketHistoryManager();
    this.pricing = new MarketPricing();
    this.guilds = new GuildMarketRegistry();
  }

  createSell({ scope = 'local', userId, guildId = null, guildName = 'Servidor', itemId, quantity, unitPrice }) {
    if (scope === 'international') {
      return this.international.createSellOrder(userId, guildId, guildName, itemId, quantity, unitPrice);
    }
    return this.local.createSellOrder(userId, itemId, quantity, unitPrice);
  }

  createBuy({ scope = 'local', userId, guildId = null, guildName = 'Servidor', itemId, quantity, unitPrice }) {
    if (scope === 'international') {
      return this.international.createBuyOrder(userId, guildId, guildName, itemId, quantity, unitPrice);
    }
    return this.local.createBuyOrder(userId, itemId, quantity, unitPrice);
  }

  cancel({ scope = 'local', side, userId, orderId }) {
    const manager = scope === 'international' ? this.international : this.local;
    if (side === 'sell') return manager.cancelSellOrder(userId, orderId);
    if (side === 'buy') return manager.cancelBuyOrder(userId, orderId);
    return [false, 'Tipo de ordem inválido.'];
  }

  dashboard(userId = null, guildId = null) {
    const uid = userId == null ? null : String(userId);
    const gid = guildId == null ? null : String(guildId);
    const localSells = this.localOrders.listSell();
    const localBuys = this.localOrders.listBuy();
    const intlSells = this.internationalOrders.listSell();
    const intlBuys = this.internationalOrders.listBuy();
    const shipments = this.logistics.load();
    const history = this.history.listAll();

    const mine = uid ? {
      local_sell: localSells.filter(o => String(o.seller_id) === uid).length,
      local_buy: localBuys.filter(o => String(o.buyer_id) === uid).length,
      international_sell: intlSells.filter(o => String(o.seller_id) === uid).length,
      international_buy: intlBuys.filter(o => String(o.buyer_id) === uid).length,
      freight_open: shipments.filter(s => s.status === 'awaiting_carrier' && ![s.buyer_id, s.seller_id].includes(uid)).length,
      freight_in_transit: shipments.filter(s => s.status === 'in_transit' && String(s.carrier_id) === uid).length,
      trades: history.filter(t => [String(t.buyer_id), String(t.seller_id)].includes(uid)).length
    } : null;

    return {
      local: { sell_orders: localSells.length, buy_orders: localBuys.length },
      international: {
        sell_orders: intlSells.length,
        buy_orders: intlBuys.length,
        guild_markets: this.guilds.list?.().length ?? this.guilds.load?.().length ?? 0
      },
      logistics: {
        awaiting_carrier: shipments.filter(s => s.status === 'awaiting_carrier').length,
        in_transit: shipments.filter(s => s.status === 'in_transit').length,
        delivered: shipments.filter(s => s.status === 'delivered').length
      },
      trades: {
        total: history.length,
        local: history.filter(t => String(t.market_scope ?? 'local') === 'local').length,
        international: history.filter(t => String(t.market_scope ?? 'local') === 'international').length
      },
      guild: gid ? {
        id: gid,
        international_sell_orders: intlSells.filter(o => String(o.origin_guild_id) === gid).length,
        international_buy_orders: intlBuys.filter(o => String(o.destination_guild_id) === gid).length,
        outbound_shipments: shipments.filter(s => String(s.origin_guild_id ?? '') === gid).length,
        inbound_shipments: shipments.filter(s => String(s.destination_guild_id ?? '') === gid).length
      } : null,
      user: mine
    };
  }

  itemSummary(itemId) {
    const local = this.pricing.marketSummary(itemId);
    const intlSells = this.internationalOrders.listSell(itemId);
    const intlBuys = this.internationalOrders.listBuy(itemId);
    return {
      ...local,
      international_best_buy: intlBuys[0]?.unit_price ?? null,
      international_best_sell: intlSells[0]?.unit_price ?? null,
      international_buy_orders: intlBuys.length,
      international_sell_orders: intlSells.length
    };
  }
}

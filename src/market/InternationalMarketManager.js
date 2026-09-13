import { ItemRegistry } from '../core/ItemRegistry.js';
import { EconomyService } from '../economy/EconomyService.js';
import { InventoryManager } from '../inventory/InventoryManager.js';
import { StorageManager } from '../storage/StorageManager.js';
import { StatisticsManager } from '../players/StatisticsManager.js';
import {
  MARKET_INTERNATIONAL_SELL_FEE,
  MARKET_INTERNATIONAL_LOGISTICS_SHARE,
  MARKET_MAX_ACTIVE_ORDERS
} from '../config/settings.js';
import { EscrowManager } from './EscrowManager.js';
import { MarketHistoryManager } from './MarketHistoryManager.js';
import { LogisticsManager } from './LogisticsManager.js';
import { GuildMarketRegistry } from './GuildMarketRegistry.js';
import { InternationalOrderManager } from './InternationalOrderManager.js';
import { MilitaryStorageManager } from '../industrial/MilitaryStorageManager.js';
import { DiplomaticPolicyService } from '../diplomacy/DiplomaticPolicyService.js';

const money = (value) => Math.round(Number(value) * 100) / 100;

export class InternationalMarketManager {
  constructor() {
    this.items = new ItemRegistry();
    this.economy = new EconomyService();
    this.inventory = new InventoryManager();
    this.storage = new StorageManager();
    this.statistics = new StatisticsManager();
    this.escrow = new EscrowManager();
    this.history = new MarketHistoryManager();
    this.logistics = new LogisticsManager();
    this.guilds = new GuildMarketRegistry();
    this.orders = new InternationalOrderManager();
    this.militaryStorage = new MilitaryStorageManager();
    this.diplomacy = new DiplomaticPolicyService();
  }

  registerGuild(guildId, guildName) {
    return this.guilds.register(guildId, guildName);
  }

  getTotalQuantity(userId, itemId) {
    const special = this.items.requiresSpecialStorage(itemId)
      ? this.militaryStorage.getQuantity(userId, this.items.getStorageType(itemId), itemId)
      : 0;
    return this.inventory.getQuantity(userId, itemId)
      + this.storage.getQuantity(userId, 'warehouse', itemId)
      + this.storage.getQuantity(userId, 'industrial', itemId)
      + special;
  }

  getAverageQuality(userId, itemId) {
    const lists = [
      this.inventory.listItems(userId),
      this.storage.listItems(userId, 'warehouse'),
      this.storage.listItems(userId, 'industrial')
    ];
    if (this.items.requiresSpecialStorage(itemId)) {
      lists.push(this.militaryStorage.listItems(userId, this.items.getStorageType(itemId)));
    }
    for (const list of lists) {
      const item = list.find((x) => x.id === itemId);
      if (item) return Number(item.quality || 50);
    }
    return 50;
  }

  consumeItem(userId, itemId, quantity) {
    let remaining = Math.trunc(Number(quantity));
    const sources = [['inventory', null], ['storage', 'warehouse'], ['storage', 'industrial']];
    if (this.items.requiresSpecialStorage(itemId)) sources.unshift(['military', this.items.getStorageType(itemId)]);
    for (const [kind, type] of sources) {
      if (remaining <= 0) break;
      const amount = kind === 'inventory'
        ? this.inventory.getQuantity(userId, itemId)
        : kind === 'military'
          ? this.militaryStorage.getQuantity(userId, type, itemId)
          : this.storage.getQuantity(userId, type, itemId);
      const take = Math.min(remaining, amount);
      if (take <= 0) continue;
      const [ok] = kind === 'inventory'
        ? this.inventory.removeItem(userId, itemId, take)
        : kind === 'military'
          ? this.militaryStorage.removeItem(userId, type, itemId, take)
          : this.storage.removeItem(userId, type, itemId, take);
      if (!ok) return false;
      remaining -= take;
    }
    return remaining <= 0;
  }

  activeOrdersCount(userId) {
    return this.orders.listUser(userId).filter((o) => o.status === 'open').length;
  }

  createSellOrder(userId, guildId, guildName, itemId, quantity, unitPrice) {
    const sellerId = String(userId);
    const originGuildId = String(guildId ?? '');
    quantity = Math.trunc(Number(quantity));
    unitPrice = money(unitPrice);

    if (!originGuildId) return [false, 'O mercado internacional só funciona dentro de um servidor.', null];
    if (quantity <= 0) return [false, 'Quantidade inválida.', null];
    if (unitPrice <= 0) return [false, 'Preço inválido.', null];
    if (!this.items.get(itemId)) return [false, 'Item não encontrado.', null];
    if (!this.items.isTradeable(itemId)) return [false, 'Item não negociável.', null];
    if (this.activeOrdersCount(sellerId) >= MARKET_MAX_ACTIVE_ORDERS) return [false, 'Limite de ordens internacionais ativas atingido.', null];
    if (this.getTotalQuantity(sellerId, itemId) < quantity) return [false, 'Quantidade insuficiente.', null];

    this.registerGuild(originGuildId, guildName);
    const quality = this.getAverageQuality(sellerId, itemId);
    if (!this.consumeItem(sellerId, itemId, quantity)) return [false, 'Falha ao reservar mercadoria.', null];

    try {
      const order = this.orders.createSell({ sellerId, guildId: originGuildId, guildName, itemId, quantity, unitPrice, quality });
      this.escrow.reserveItem(order.id, sellerId, itemId, quantity, quality);
      order.match_result = this.matchSellOrder(sellerId, order.id);
      return [true, 'Ordem internacional de venda criada.', order];
    } catch {
      this.inventory.addItem(sellerId, itemId, quantity, quality);
      return [false, 'Falha ao criar a ordem internacional de venda.', null];
    }
  }

  createBuyOrder(userId, guildId, guildName, itemId, quantity, unitPrice) {
    const buyerId = String(userId);
    const destinationGuildId = String(guildId ?? '');
    quantity = Math.trunc(Number(quantity));
    unitPrice = money(unitPrice);

    if (!destinationGuildId) return [false, 'O mercado internacional só funciona dentro de um servidor.', null];
    if (quantity <= 0) return [false, 'Quantidade inválida.', null];
    if (unitPrice <= 0) return [false, 'Preço inválido.', null];
    if (!this.items.get(itemId)) return [false, 'Item não encontrado.', null];
    if (!this.items.isTradeable(itemId)) return [false, 'Esse item não pode ser negociado.', null];
    if (this.activeOrdersCount(buyerId) >= MARKET_MAX_ACTIVE_ORDERS) return [false, 'Limite de ordens internacionais ativas atingido.', null];

    this.registerGuild(destinationGuildId, guildName);
    const reserved = money(quantity * unitPrice);
    if (this.economy.getBalance(buyerId) < reserved) return [false, `Saldo insuficiente. Necessário: $${reserved.toFixed(2)}`, null];
    if (!this.economy.remove(buyerId, reserved)) return [false, 'Não foi possível reservar o dinheiro.', null];

    try {
      const order = this.orders.createBuy({ buyerId, guildId: destinationGuildId, guildName, itemId, quantity, unitPrice });
      this.escrow.reserveMoney(order.id, buyerId, reserved);
      order.match_result = this.matchBuyOrder(buyerId, order.id);
      return [true, 'Ordem internacional de compra criada.', order];
    } catch {
      this.economy.add(buyerId, reserved);
      return [false, 'Falha ao criar a ordem internacional de compra.', null];
    }
  }

  executeTrade(sellOrder, buyOrder, quantity) {
    const qty = Math.min(Math.trunc(Number(quantity)), Number(sellOrder.remaining || 0), Number(buyOrder.remaining || 0));
    if (qty <= 0) return null;

    const seller = String(sellOrder.seller_id);
    const buyer = String(buyOrder.buyer_id);
    if (seller === buyer) return null;
    if (String(sellOrder.origin_guild_id) === String(buyOrder.destination_guild_id)) return null;
    const category = this.items.get(sellOrder.item_id)?.category ?? 'all';
    const [tradeAllowed] = this.diplomacy.canTradeGuilds(sellOrder.origin_guild_id, buyOrder.destination_guild_id, category);
    if (!tradeAllowed) return null;

    const escrowItem = this.escrow.getItem(sellOrder.id);
    const moneyEscrow = this.escrow.getMoney(buyOrder.id);
    if (!escrowItem || !moneyEscrow || Number(escrowItem.quantity) < qty) return null;

    const unitPrice = money(Number(sellOrder.unit_price));
    const subtotal = money(unitPrice * qty);
    if (Number(moneyEscrow.amount) < subtotal) return null;

    const diplomaticFeeMultiplier = this.diplomacy.tradeFeeMultiplierGuilds(sellOrder.origin_guild_id, buyOrder.destination_guild_id);
    const fee = money(subtotal * MARKET_INTERNATIONAL_SELL_FEE * diplomaticFeeMultiplier);
    const sellerReceives = money(subtotal - fee);
    const logisticsReward = money(Math.max(0.01, fee * MARKET_INTERNATIONAL_LOGISTICS_SHARE));

    try {
      this.economy.add(seller, sellerReceives);
    } catch {
      return null;
    }

    const newSell = Math.max(0, Number(sellOrder.remaining) - qty);
    const newBuy = Math.max(0, Number(buyOrder.remaining) - qty);
    this.orders.updateOrder('sell', sellOrder.id, { remaining: newSell, status: newSell <= 0 ? 'completed' : 'open' });
    this.orders.updateOrder('buy', buyOrder.id, { remaining: newBuy, status: newBuy <= 0 ? 'completed' : 'open' });

    this.escrow.updateItemQuantity(sellOrder.id, Math.max(0, Number(escrowItem.quantity) - qty));
    const remainingMoney = money(Number(moneyEscrow.amount) - subtotal);
    if (newBuy <= 0) {
      this.escrow.releaseMoney(buyOrder.id);
      if (remainingMoney > 0) this.economy.add(buyer, remainingMoney);
    } else {
      this.escrow.updateMoney(buyOrder.id, remainingMoney);
    }
    if (newSell <= 0) this.escrow.releaseItem(sellOrder.id);

    const trade = this.history.registerTrade({
      market_scope: 'international',
      item_id: sellOrder.item_id,
      buyer_id: buyer,
      seller_id: seller,
      buy_order_id: buyOrder.id,
      sell_order_id: sellOrder.id,
      origin_guild_id: String(sellOrder.origin_guild_id),
      origin_guild_name: String(sellOrder.origin_guild_name),
      destination_guild_id: String(buyOrder.destination_guild_id),
      destination_guild_name: String(buyOrder.destination_guild_name),
      quantity: qty,
      unit_price: unitPrice,
      subtotal,
      total: subtotal,
      fee,
      seller_receives: sellerReceives,
      logistics_reward: logisticsReward,
      diplomatic_fee_multiplier: diplomaticFeeMultiplier,
      quality: Number(escrowItem.quality || 50)
    });

    const shipment = this.logistics.createFromTrade(trade);
    trade.shipment_id = shipment.id;
    trade.delivery_status = shipment.status;

    this.statistics.increment(buyer, 'international_market_purchases', 1);
    this.statistics.increment(seller, 'international_market_sales', 1);
    this.statistics.increment(buyer, 'transactions', 1);
    this.statistics.increment(seller, 'transactions', 1);
    return trade;
  }

  matchBuyOrder(buyerId, buyOrderId) {
    const order = this.orders.getBuy(buyOrderId);
    if (!order || order.status !== 'open') return { matched: false, trades: [], filled: 0, remaining: Number(order?.remaining || 0) };

    let remaining = Number(order.remaining);
    let filled = 0;
    const trades = [];
    const candidates = this.orders.listSell(order.item_id).filter((o) =>
      Number(o.unit_price) <= Number(order.unit_price)
      && String(o.origin_guild_id) !== String(order.destination_guild_id)
    );

    for (const sell of candidates) {
      if (remaining <= 0) break;
      if (String(sell.seller_id) === String(buyerId)) continue;
      const currentBuy = this.orders.getBuy(buyOrderId);
      const qty = Math.min(remaining, Number(sell.remaining));
      const trade = this.executeTrade(sell, currentBuy, qty);
      if (!trade) continue;
      trades.push(trade);
      filled += qty;
      remaining = Number(this.orders.getBuy(buyOrderId)?.remaining || 0);
    }

    return { matched: trades.length > 0, trades, filled, remaining };
  }

  matchSellOrder(sellerId, sellOrderId) {
    const order = this.orders.getSell(sellOrderId);
    if (!order || order.status !== 'open') return { matched: false, trades: [], filled: 0, remaining: Number(order?.remaining || 0) };

    let remaining = Number(order.remaining);
    let filled = 0;
    const trades = [];
    const candidates = this.orders.listBuy(order.item_id).filter((o) =>
      Number(o.unit_price) >= Number(order.unit_price)
      && String(o.destination_guild_id) !== String(order.origin_guild_id)
    );

    for (const buy of candidates) {
      if (remaining <= 0) break;
      if (String(buy.buyer_id) === String(sellerId)) continue;
      const currentSell = this.orders.getSell(sellOrderId);
      const qty = Math.min(remaining, Number(buy.remaining));
      const trade = this.executeTrade(currentSell, buy, qty);
      if (!trade) continue;
      trades.push(trade);
      filled += qty;
      remaining = Number(this.orders.getSell(sellOrderId)?.remaining || 0);
    }

    return { matched: trades.length > 0, trades, filled, remaining };
  }

  cancelSellOrder(userId, orderId) {
    const order = this.orders.getSell(orderId);
    if (!order) return [false, 'Ordem internacional não encontrada.'];
    if (String(order.seller_id) !== String(userId)) return [false, 'Essa ordem não pertence a você.'];
    if (order.status !== 'open') return [false, 'Essa ordem não está aberta.'];

    const escrow = this.escrow.releaseItem(orderId);
    if (escrow && Number(escrow.quantity) > 0) {
      const [ok] = this.inventory.addItem(userId, escrow.item_id, Number(escrow.quantity), Number(escrow.quality || 50));
      if (!ok) {
        this.escrow.reserveItem(orderId, userId, escrow.item_id, escrow.quantity, escrow.quality);
        return [false, 'Sem espaço no inventário para devolver a mercadoria.'];
      }
    }
    this.orders.updateOrder('sell', orderId, { status: 'cancelled', remaining: 0 });
    return [true, 'Ordem internacional de venda cancelada.'];
  }

  cancelBuyOrder(userId, orderId) {
    const order = this.orders.getBuy(orderId);
    if (!order) return [false, 'Ordem internacional não encontrada.'];
    if (String(order.buyer_id) !== String(userId)) return [false, 'Essa ordem não pertence a você.'];
    if (order.status !== 'open') return [false, 'Essa ordem não está aberta.'];

    const escrow = this.escrow.releaseMoney(orderId);
    if (escrow && Number(escrow.amount) > 0) this.economy.add(userId, Number(escrow.amount));
    this.orders.updateOrder('buy', orderId, { status: 'cancelled', remaining: 0 });
    return [true, 'Ordem internacional de compra cancelada.'];
  }
}

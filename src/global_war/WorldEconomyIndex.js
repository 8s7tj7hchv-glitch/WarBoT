import { CountryManager } from '../world/CountryManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
import { InfrastructureManager } from '../world/InfrastructureManager.js';
import { MarketHistoryManager } from '../market/MarketHistoryManager.js';
import { WarEconomyManager } from '../warfare/WarEconomyManager.js';
import { NationalStockpileManager } from '../military_industry/NationalStockpileManager.js';
import { GlobalEventManager } from './GlobalEventManager.js';

export class WorldEconomyIndex {
  constructor({ countries = new CountryManager(), territories = new TerritoryManager(), infrastructure = new InfrastructureManager(), history = new MarketHistoryManager(), warEconomy = new WarEconomyManager(), stockpiles = new NationalStockpileManager(), events = new GlobalEventManager() } = {}) {
    this.countries = countries; this.territories = territories; this.infrastructure = infrastructure; this.history = history; this.warEconomy = warEconomy; this.stockpiles = stockpiles; this.events = events;
  }
  country(countryId) {
    const country = this.countries.get(countryId); if (!country) return null;
    const controlled = this.territories.list().filter(t => t.controller_country_id === country.id);
    const infra = controlled.reduce((s, t) => s + this.infrastructure.score(t.id), 0);
    const stock = this.stockpiles.list(country.id).reduce((s, x) => s + Number(x.quantity ?? 0), 0);
    const pressure = this.warEconomy.list().filter(e => controlled.some(t => t.id === e.territory_id));
    const warPenalty = pressure.length ? pressure.reduce((s, e) => s + Number(e.production_penalty ?? 0), 0) / pressure.length : 0;
    const stability = Math.max(0, Math.min(100, 70 + controlled.length * 3 + infra * 0.5 - warPenalty * 100));
    return { country, controlled: controlled.length, infrastructure: infra, stockpile_units: stock, war_penalty: warPenalty, stability: Number(stability.toFixed(1)) };
  }
  global() {
    const countries = this.countries.list(); const territories = this.territories.list(); const trades = this.history.listAll(); const events = this.events.active();
    const volume = trades.reduce((s, t) => s + Number(t.quantity ?? 0) * Number(t.price ?? t.unit_price ?? 0), 0);
    const effects = this.warEconomy.summary();
    const modifiers = this.events.modifiers();
    const controlled = territories.filter(t => t.controller_country_id).length;
    const stability = Math.max(0, Math.min(100, 80 - effects.average_production_penalty * 100 - Math.max(0, modifiers.market_volatility) * 35));
    return {
      countries: countries.length,
      territories: territories.length,
      controlled_territories: controlled,
      market_trades: trades.length,
      market_volume: Number(volume.toFixed(2)),
      active_events: events.length,
      event_modifiers: modifiers,
      war_effects: effects.effects,
      stability_index: Number(stability.toFixed(1))
    };
  }
}

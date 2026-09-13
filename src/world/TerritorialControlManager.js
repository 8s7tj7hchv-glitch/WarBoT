import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { WORLD_DATA_DIR } from '../config/settings.js';
import { TerritoryManager } from './TerritoryManager.js';
import { BorderManager } from './BorderManager.js';
import { CountryManager } from './CountryManager.js';
const HISTORY = path.join(WORLD_DATA_DIR, 'control_history.json');
export class TerritorialControlManager {
  constructor({ territories = new TerritoryManager(), borders = new BorderManager(), countries = new CountryManager() } = {}) { this.territories = territories; this.borders = borders; this.countries = countries; JsonManager.ensureFile(HISTORY, []); }
  claimNeutral(countryId, territoryId, { actorId } = {}) {
    const c = this.countries.get(countryId), t = this.territories.get(territoryId);
    if (!c) throw new Error('País não encontrado.'); if (!t) throw new Error('Território não encontrado.'); if (t.owner_country_id) throw new Error('Território já possui proprietário.');
    const owned = this.territories.byCountry(c.id).filter((x) => x.owner_country_id === c.id);
    if (owned.length > 0 && !owned.some((x) => this.borders.areAdjacent(x.id, t.id))) throw new Error('O território precisa fazer fronteira com uma área do país.');
    const updated = this.territories.update(t.id, { owner_country_id: c.id, controller_country_id: c.id, capital: owned.length === 0 });
    if (owned.length === 0) this.countries.setCapital(c.id, t.id);
    this.log({ action: 'claim', territory_id: t.id, to_country_id: c.id, actor_id: String(actorId ?? '') });
    return updated;
  }
  transfer(territoryId, fromCountryId, toCountryId, { actorId } = {}) {
    const t = this.territories.get(territoryId); if (!t) throw new Error('Território não encontrado.');
    if (t.owner_country_id !== String(fromCountryId)) throw new Error('O país de origem não é proprietário.');
    if (!this.countries.get(toCountryId)) throw new Error('País de destino não encontrado.');
    const updated = this.territories.update(territoryId, { owner_country_id: String(toCountryId), controller_country_id: String(toCountryId), capital: false });
    this.log({ action: 'transfer', territory_id: t.id, from_country_id: String(fromCountryId), to_country_id: String(toCountryId), actor_id: String(actorId ?? '') }); return updated;
  }
  setController(territoryId, countryId, { actorId } = {}) {
    const t = this.territories.get(territoryId); if (!t) throw new Error('Território não encontrado.');
    const updated = this.territories.update(territoryId, { controller_country_id: countryId ? String(countryId) : null });
    this.log({ action: 'control', territory_id: t.id, from_country_id: t.controller_country_id, to_country_id: countryId ? String(countryId) : null, actor_id: String(actorId ?? '') }); return updated;
  }
  log(entry) { const h = JsonManager.load(HISTORY, []); h.push({ ...entry, created_at: new Date().toISOString() }); JsonManager.save(HISTORY, h); }
}

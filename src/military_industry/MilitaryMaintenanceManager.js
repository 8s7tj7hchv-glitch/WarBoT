import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_INDUSTRY_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { UnitManager } from '../military/UnitManager.js';
import { MilitaryAssetManager } from '../military/MilitaryAssetManager.js';
import { NationalStockpileManager } from './NationalStockpileManager.js';
import { TechnologyManager } from './TechnologyManager.js';

const HISTORY = path.join(MILITARY_INDUSTRY_DATA_DIR, 'maintenance_history.json');
const clone = (v) => structuredClone(v);
const recipes = {
  unit: { steel_bolt: 2, industrial_filter: 1 },
  army: { aegis_plating: 1, steel_bolt: 2 },
  air_force: { flux_cell: 1, orion_sensor: 1 },
  navy: { aegis_plating: 2, industrial_filter: 1 },
  strategic: { vector_core: 1, flux_cell: 1 }
};

export class MilitaryMaintenanceManager {
  constructor({ countries = new CountryManager(), units = new UnitManager(), assets = new MilitaryAssetManager(), stockpile = new NationalStockpileManager(), technologies = new TechnologyManager() } = {}) {
    this.countries = countries;
    this.units = units;
    this.assets = assets;
    this.stockpile = stockpile;
    this.technologies = technologies;
    JsonManager.ensureFile(HISTORY, []);
  }

  record(event) { const h = JsonManager.load(HISTORY, []); h.push({ ...clone(event), at: new Date().toISOString() }); JsonManager.save(HISTORY, h.slice(-5000)); }
  costFor(kind, branch = 'army') { return clone(kind === 'unit' ? recipes.unit : (recipes[branch] ?? recipes.army)); }

  hasMaterials(countryId, cost) {
    for (const [id, q] of Object.entries(cost)) if (this.stockpile.getQuantity(countryId, id) < Number(q)) return [false, `Falta ${id} ×${q} no estoque nacional.`];
    return [true, 'Materiais disponíveis.'];
  }

  consume(countryId, cost) {
    const done = [];
    for (const [id, q] of Object.entries(cost)) {
      const [ok] = this.stockpile.remove(countryId, id, q);
      if (!ok) { for (const x of done) this.stockpile.add(countryId, x.id, x.q, 50); return false; }
      done.push({ id, q });
    }
    return true;
  }

  maintainUnit(userId, unitId) {
    const country = this.countries.memberCountry(userId);
    if (!country) return [false, 'Você precisa pertencer a um país.', null];
    if (country.leader_id !== String(userId)) return [false, 'Somente o líder pode autorizar manutenção nacional.', null];
    const unit = this.units.get(unitId);
    if (!unit || unit.country_id !== country.id) return [false, 'Unidade não encontrada nesse país.', null];
    const cost = this.costFor('unit'); const [has, msg] = this.hasMaterials(country.id, cost); if (!has) return [false, msg, null];
    if (!this.consume(country.id, cost)) return [false, 'Falha ao consumir materiais.', null];
    const bonus = this.technologies.maintenanceBonus(country.id);
    const readinessGain = Math.round(20 * (1 + bonus));
    const moraleGain = Math.round(8 * (1 + bonus));
    const updated = this.units.update(unit.id, { readiness: Math.min(100, Number(unit.readiness ?? 0) + readinessGain), morale: Math.min(100, Number(unit.morale ?? 0) + moraleGain) });
    this.record({ type: 'unit', country_id: country.id, target_id: unit.id, user_id: String(userId), cost, readiness_gain: readinessGain, morale_gain: moraleGain });
    return [true, 'Manutenção da unidade concluída.', updated];
  }

  maintainAsset(userId, assetId) {
    const country = this.countries.memberCountry(userId);
    if (!country) return [false, 'Você precisa pertencer a um país.', null];
    if (country.leader_id !== String(userId)) return [false, 'Somente o líder pode autorizar manutenção nacional.', null];
    const asset = this.assets.get(assetId);
    if (!asset || asset.country_id !== country.id) return [false, 'Ativo não encontrado nesse país.', null];
    const cost = this.costFor('asset', asset.branch); const [has, msg] = this.hasMaterials(country.id, cost); if (!has) return [false, msg, null];
    if (!this.consume(country.id, cost)) return [false, 'Falha ao consumir materiais.', null];
    const bonus = this.technologies.maintenanceBonus(country.id);
    const conditionGain = Math.round(25 * (1 + bonus));
    const readinessGain = Math.round(15 * (1 + bonus));
    const updated = this.assets.update(asset.id, { condition: Math.min(100, Number(asset.condition ?? 0) + conditionGain), readiness: Math.min(100, Number(asset.readiness ?? 0) + readinessGain) });
    this.record({ type: 'asset', country_id: country.id, target_id: asset.id, user_id: String(userId), cost, condition_gain: conditionGain, readiness_gain: readinessGain });
    return [true, 'Manutenção do ativo concluída.', updated];
  }

  history(countryId, limit = 20) { return JsonManager.load(HISTORY, []).filter((x) => x.country_id === String(countryId)).slice(-Math.max(1, Number(limit) || 20)).reverse().map(clone); }
}

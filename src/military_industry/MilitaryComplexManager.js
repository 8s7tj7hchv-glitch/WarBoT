import path from 'node:path';
import crypto from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_INDUSTRY_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
import { EconomyService } from '../economy/EconomyService.js';
import { TechnologyManager } from './TechnologyManager.js';

const DEF_FILE = path.join(MILITARY_INDUSTRY_DATA_DIR, 'complex_definitions.json');
const FILE = path.join(MILITARY_INDUSTRY_DATA_DIR, 'complexes.json');
const HISTORY = path.join(MILITARY_INDUSTRY_DATA_DIR, 'complex_history.json');
const clone = (v) => structuredClone(v);

export class MilitaryComplexManager {
  constructor({ countries = new CountryManager(), territories = new TerritoryManager(), economy = new EconomyService(), technologies = new TechnologyManager() } = {}) {
    this.countries = countries;
    this.territories = territories;
    this.economy = economy;
    this.technologies = technologies;
    JsonManager.ensureFile(DEF_FILE, {});
    JsonManager.ensureFile(FILE, {});
    JsonManager.ensureFile(HISTORY, []);
  }

  definitions() { const d = JsonManager.load(DEF_FILE, {}); return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; }
  getDefinition(id) { const d = this.definitions()[String(id)]; return d ? { id: String(id), ...clone(d) } : null; }
  load() { const d = JsonManager.load(FILE, {}); return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; }
  save(d) { JsonManager.save(FILE, d); }
  list(countryId) { return Object.values(this.load()).filter((x) => x.country_id === String(countryId)).map(clone); }
  get(id) { const x = this.load()[String(id)]; return x ? clone(x) : null; }
  record(event) { const h = JsonManager.load(HISTORY, []); h.push({ ...clone(event), at: new Date().toISOString() }); JsonManager.save(HISTORY, h.slice(-5000)); }

  buildCost(type, level = 0) {
    const d = this.getDefinition(type);
    if (!d) return null;
    return Math.round(Number(d.base_cost ?? 0) * (1 + Math.max(0, Number(level)) * 0.75));
  }

  canBuild(userId, territoryId, type) {
    const country = this.countries.memberCountry(userId);
    if (!country) return [false, 'Você precisa pertencer a um país.', null];
    if (country.leader_id !== String(userId)) return [false, 'Somente o líder pode construir complexos nacionais.', null];
    const territory = this.territories.get(territoryId);
    if (!territory || territory.controller_country_id !== country.id) return [false, 'O território precisa estar sob controle do país.', null];
    const def = this.getDefinition(type);
    if (!def) return [false, 'Tipo de complexo inválido.', null];
    if (def.required_technology && !this.technologies.isUnlocked(country.id, def.required_technology)) return [false, `Tecnologia necessária: ${def.required_technology}.`, null];
    const current = this.list(country.id).find((x) => x.territory_id === territory.id && x.type === def.id);
    const currentLevel = Number(current?.level ?? 0);
    if (currentLevel >= Number(def.max_level ?? 5)) return [false, 'Complexo já está no nível máximo.', null];
    const cost = this.buildCost(def.id, currentLevel);
    if (this.economy.getBalance(userId) < cost) return [false, `Saldo insuficiente. Necessário: $${cost.toFixed(2)}.`, null];
    return [true, 'Construção disponível.', { country, territory, def, current, cost }];
  }

  build(userId, territoryId, type) {
    const [ok, msg, ctx] = this.canBuild(userId, territoryId, type);
    if (!ok) return [false, msg, null];
    if (!this.economy.remove(userId, ctx.cost)) return [false, 'Não foi possível cobrar a construção.', null];
    const all = this.load();
    const now = new Date().toISOString();
    const id = ctx.current?.id ?? `complex_${crypto.randomUUID()}`;
    const level = Number(ctx.current?.level ?? 0) + 1;
    all[id] = {
      id,
      country_id: ctx.country.id,
      territory_id: ctx.territory.id,
      type: ctx.def.id,
      name: ctx.def.name,
      level,
      status: 'active',
      created_at: ctx.current?.created_at ?? now,
      updated_at: now
    };
    this.save(all);
    this.record({ type: ctx.current ? 'upgrade' : 'build', complex_id: id, country_id: ctx.country.id, territory_id: ctx.territory.id, complex_type: ctx.def.id, level, cost: ctx.cost, user_id: String(userId) });
    return [true, `${ctx.def.name} agora está no nível ${level}.`, clone(all[id])];
  }

  levelForFacility(countryId, facilityId, territoryId = null) {
    if (!facilityId) return 99;
    let max = 0;
    for (const c of this.list(countryId)) {
      const def = this.getDefinition(c.type);
      const sameTerritory = territoryId == null || c.territory_id === String(territoryId);
      if (sameTerritory && def?.facility === String(facilityId) && c.status === 'active') max = Math.max(max, Number(c.level ?? 0));
    }
    return max;
  }

  researchBonus(countryId) {
    return this.list(countryId).reduce((sum, c) => {
      const def = this.getDefinition(c.type);
      return sum + (c.status === 'active' ? Number(def?.research_bonus ?? 0) * Number(c.level ?? 0) : 0);
    }, 0);
  }

  storageBonus(countryId) {
    return this.list(countryId).reduce((sum, c) => {
      const def = this.getDefinition(c.type);
      return sum + (c.status === 'active' ? Number(def?.storage_bonus ?? 0) * Number(c.level ?? 0) : 0);
    }, 0);
  }
}

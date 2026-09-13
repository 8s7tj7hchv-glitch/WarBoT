import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_INDUSTRY_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { EconomyService } from '../economy/EconomyService.js';
import { TechnologyManager } from './TechnologyManager.js';
import { MilitaryComplexManager } from './MilitaryComplexManager.js';

const RESEARCH_FILE = path.join(MILITARY_INDUSTRY_DATA_DIR, 'research.json');
const HISTORY_FILE = path.join(MILITARY_INDUSTRY_DATA_DIR, 'research_history.json');
const clone = (v) => structuredClone(v);

export class ResearchManager {
  constructor({ countries = new CountryManager(), economy = new EconomyService(), technologies = new TechnologyManager(), complexes = null } = {}) {
    this.countries = countries;
    this.economy = economy;
    this.technologies = technologies;
    this.complexes = complexes;
    JsonManager.ensureFile(RESEARCH_FILE, {});
    JsonManager.ensureFile(HISTORY_FILE, []);
  }

  load() {
    const data = JsonManager.load(RESEARCH_FILE, {});
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  }

  save(data) { JsonManager.save(RESEARCH_FILE, data); }

  get(countryId) { return this.technologies.state(countryId); }

  record(event) {
    const history = JsonManager.load(HISTORY_FILE, []);
    history.push({ ...clone(event), at: new Date().toISOString() });
    JsonManager.save(HISTORY_FILE, history.slice(-5000));
  }

  researchBonus(countryId) {
    if (!this.complexes) return 0;
    return this.complexes.researchBonus(countryId);
  }

  fund(userId, amount) {
    const country = this.countries.memberCountry(userId);
    if (!country) return [false, 'Você precisa pertencer a um país.', null];
    const money = Math.floor(Number(amount));
    if (!Number.isFinite(money) || money < 10) return [false, 'O investimento mínimo é $10.', null];
    if (!this.economy.remove(userId, money)) return [false, 'Saldo insuficiente.', null];

    const basePoints = Math.max(1, Math.floor(money / 10));
    const bonus = this.researchBonus(country.id);
    const points = Math.max(1, Math.floor(basePoints * (1 + bonus)));
    const all = this.load();
    const key = country.id;
    const current = all[key] ?? { points: 0, unlocked: [], total_invested: 0 };
    current.points = Number(current.points ?? 0) + points;
    current.total_invested = Number(current.total_invested ?? 0) + money;
    current.updated_at = new Date().toISOString();
    all[key] = current;
    this.save(all);
    this.record({ type: 'fund', country_id: key, user_id: String(userId), money, points });
    return [true, `Pesquisa financiada: +${points} ponto(s).`, { country_id: key, money, points, balance_points: current.points }];
  }

  unlock(userId, technologyId) {
    const country = this.countries.memberCountry(userId);
    if (!country) return [false, 'Você precisa pertencer a um país.', null];
    if (country.leader_id !== String(userId)) return [false, 'Somente o líder do país pode liberar tecnologias.', null];
    const tech = this.technologies.get(technologyId);
    if (!tech) return [false, 'Tecnologia não encontrada.', null];
    if (this.technologies.isUnlocked(country.id, tech.id)) return [false, 'Tecnologia já desbloqueada.', null];
    const missing = this.technologies.missingPrerequisites(country.id, tech.id);
    if (missing.length) return [false, `Pré-requisitos pendentes: ${missing.join(', ')}.`, null];

    const all = this.load();
    const current = all[country.id] ?? { points: 0, unlocked: [], total_invested: 0 };
    const cost = Math.max(0, Number(tech.cost ?? 0));
    if (Number(current.points ?? 0) < cost) return [false, `Pontos insuficientes. Necessário: ${cost}.`, null];
    current.points = Number(current.points) - cost;
    current.unlocked = [...new Set([...(current.unlocked ?? []), tech.id])];
    current.updated_at = new Date().toISOString();
    all[country.id] = current;
    this.save(all);
    this.record({ type: 'unlock', country_id: country.id, user_id: String(userId), technology_id: tech.id, cost });
    return [true, `${tech.name} desbloqueada.`, { technology: tech, remaining_points: current.points }];
  }
}

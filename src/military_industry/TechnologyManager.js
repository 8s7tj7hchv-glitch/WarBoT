import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_INDUSTRY_DATA_DIR } from '../config/settings.js';

const TREE_FILE = path.join(MILITARY_INDUSTRY_DATA_DIR, 'technology_tree.json');
const RESEARCH_FILE = path.join(MILITARY_INDUSTRY_DATA_DIR, 'research.json');
const clone = (v) => structuredClone(v);

export class TechnologyManager {
  constructor() {
    JsonManager.ensureFile(TREE_FILE, {});
    JsonManager.ensureFile(RESEARCH_FILE, {});
  }

  tree() {
    const data = JsonManager.load(TREE_FILE, {});
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  }

  list() {
    return Object.entries(this.tree()).map(([id, raw]) => ({ id, ...clone(raw) }));
  }

  get(id) {
    const raw = this.tree()[String(id)];
    return raw ? { id: String(id), ...clone(raw) } : null;
  }

  state(countryId) {
    const data = JsonManager.load(RESEARCH_FILE, {});
    const current = data[String(countryId)] ?? {};
    return {
      points: Math.max(0, Number(current.points ?? 0)),
      unlocked: Array.isArray(current.unlocked) ? [...new Set(current.unlocked.map(String))] : [],
      total_invested: Math.max(0, Number(current.total_invested ?? 0)),
      updated_at: current.updated_at ?? null
    };
  }

  isUnlocked(countryId, technologyId) {
    return this.state(countryId).unlocked.includes(String(technologyId));
  }

  prerequisitesMet(countryId, technologyId) {
    const tech = this.get(technologyId);
    if (!tech) return false;
    const unlocked = new Set(this.state(countryId).unlocked);
    return (tech.prerequisites ?? []).every((id) => unlocked.has(String(id)));
  }

  missingPrerequisites(countryId, technologyId) {
    const tech = this.get(technologyId);
    if (!tech) return [];
    const unlocked = new Set(this.state(countryId).unlocked);
    return (tech.prerequisites ?? []).filter((id) => !unlocked.has(String(id)));
  }

  isFacilityUnlocked(countryId, facilityId) {
    if (!facilityId) return true;
    return this.list().some((tech) => this.isUnlocked(countryId, tech.id) && (tech.unlocks_facilities ?? []).includes(String(facilityId)));
  }

  isRecipeUnlocked(countryId, recipeId) {
    return this.list().some((tech) => this.isUnlocked(countryId, tech.id) && (tech.unlocks_recipes ?? []).includes(String(recipeId)));
  }

  productionBonus(countryId) {
    return this.list().filter((tech) => this.isUnlocked(countryId, tech.id)).reduce((sum, tech) => sum + Number(tech.production_bonus ?? 0), 0);
  }

  maintenanceBonus(countryId) {
    return this.list().filter((tech) => this.isUnlocked(countryId, tech.id)).reduce((sum, tech) => sum + Number(tech.maintenance_bonus ?? 0), 0);
  }
}

import { CountryManager } from '../world/CountryManager.js';
import { TechnologyManager } from './TechnologyManager.js';
import { ResearchManager } from './ResearchManager.js';
import { MilitaryComplexManager } from './MilitaryComplexManager.js';
import { NationalStockpileManager } from './NationalStockpileManager.js';
import { NationalMilitaryProductionManager } from './NationalMilitaryProductionManager.js';
import { MilitaryMaintenanceManager } from './MilitaryMaintenanceManager.js';
import { RecipeRegistry } from '../production/RecipeRegistry.js';

export class MilitaryIndustryHubService {
  constructor() {
    this.countries = new CountryManager();
    this.technologies = new TechnologyManager();
    this.complexes = new MilitaryComplexManager({ countries: this.countries, technologies: this.technologies });
    this.research = new ResearchManager({ countries: this.countries, technologies: this.technologies, complexes: this.complexes });
    this.stockpile = new NationalStockpileManager({ countries: this.countries, complexes: this.complexes });
    this.production = new NationalMilitaryProductionManager({ countries: this.countries, technologies: this.technologies, complexes: this.complexes, stockpile: this.stockpile });
    this.maintenance = new MilitaryMaintenanceManager({ countries: this.countries, stockpile: this.stockpile, technologies: this.technologies });
    this.recipes = new RecipeRegistry();
  }

  dashboard(userId) {
    const country = this.countries.memberCountry(userId);
    if (!country) return { country: null, research: null, technologies: { unlocked: 0, total: this.technologies.list().length }, complexes: [], stockpile: { used: 0, capacity: 0, items: 0 }, recipes: { unlocked: 0, total: this.recipes.listCategory('military').length } };
    const research = this.research.get(country.id);
    const complexes = this.complexes.list(country.id);
    const techList = this.technologies.list();
    const militaryRecipes = this.recipes.listCategory('military');
    return {
      country,
      research,
      technologies: { unlocked: research.unlocked.length, total: techList.length },
      complexes,
      stockpile: { used: this.stockpile.used(country.id), capacity: this.stockpile.capacity(country.id), items: this.stockpile.list(country.id).length },
      recipes: { unlocked: militaryRecipes.filter((r) => this.technologies.isRecipeUnlocked(country.id, r.id)).length, total: militaryRecipes.length },
      bonuses: { production: this.technologies.productionBonus(country.id), maintenance: this.technologies.maintenanceBonus(country.id), research: this.complexes.researchBonus(country.id) }
    };
  }

  audit() {
    const issues = [];
    const techs = this.technologies.list();
    const techIds = new Set(techs.map((x) => x.id));
    const recipes = new Set(this.recipes.listCategory('military').map((x) => x.id));
    const defs = this.complexes.definitions();
    for (const t of techs) {
      for (const pre of t.prerequisites ?? []) if (!techIds.has(String(pre))) issues.push({ type: 'UNKNOWN_TECH_PREREQUISITE', technology: t.id, prerequisite: pre });
      for (const recipe of t.unlocks_recipes ?? []) if (!recipes.has(String(recipe))) issues.push({ type: 'UNKNOWN_RECIPE_UNLOCK', technology: t.id, recipe });
    }
    for (const [id, def] of Object.entries(defs)) if (def.required_technology && !techIds.has(String(def.required_technology))) issues.push({ type: 'UNKNOWN_COMPLEX_TECH', complex: id, technology: def.required_technology });
    return { ok: issues.length === 0, issues };
  }
}

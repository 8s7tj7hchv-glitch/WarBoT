import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_INDUSTRY_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
import { RecipeRegistry } from '../production/RecipeRegistry.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
import { TechnologyManager } from './TechnologyManager.js';
import { MilitaryComplexManager } from './MilitaryComplexManager.js';
import { NationalStockpileManager } from './NationalStockpileManager.js';

const HISTORY = path.join(MILITARY_INDUSTRY_DATA_DIR, 'production_history.json');
const clone = (v) => structuredClone(v);

export class NationalMilitaryProductionManager {
  constructor({ countries = new CountryManager(), territories = new TerritoryManager(), recipes = new RecipeRegistry(), items = new ItemRegistry(), technologies = new TechnologyManager(), complexes = null, stockpile = null } = {}) {
    this.countries = countries;
    this.territories = territories;
    this.recipes = recipes;
    this.items = items;
    this.technologies = technologies;
    this.complexes = complexes ?? new MilitaryComplexManager({ countries, territories, technologies });
    this.stockpile = stockpile ?? new NationalStockpileManager({ items, countries, complexes: this.complexes });
    JsonManager.ensureFile(HISTORY, []);
  }

  record(event) { const h = JsonManager.load(HISTORY, []); h.push({ ...clone(event), at: new Date().toISOString() }); JsonManager.save(HISTORY, h.slice(-5000)); }

  canProduce(userId, territoryId, recipeId, amount = 1) {
    const country = this.countries.memberCountry(userId);
    if (!country) return [false, 'Você precisa pertencer a um país.', null];
    if (country.leader_id !== String(userId)) return [false, 'Somente o líder pode autorizar produção militar nacional.', null];
    const territory = this.territories.get(territoryId);
    if (!territory || territory.controller_country_id !== country.id) return [false, 'Território de produção inválido.', null];
    const recipe = this.recipes.get(recipeId);
    if (!recipe || recipe.category !== 'military') return [false, 'Receita militar fictícia não encontrada.', null];
    const count = Math.trunc(Number(amount));
    if (count <= 0) return [false, 'Quantidade inválida.', null];
    if (!this.technologies.isRecipeUnlocked(country.id, recipe.id)) return [false, 'Tecnologia dessa receita ainda não foi desbloqueada.', null];
    const level = this.complexes.levelForFacility(country.id, recipe.facility, territory.id);
    if (level < Number(recipe.facility_level ?? 1)) return [false, `Complexo ${recipe.facility} nível ${recipe.facility_level ?? 1} necessário.`, null];
    for (const [itemId, q] of Object.entries(recipe.inputs ?? {})) {
      const needed = Number(q) * count;
      if (this.stockpile.getQuantity(country.id, itemId) < needed) return [false, `Estoque nacional insuficiente: ${itemId} ×${needed}.`, null];
    }
    const outputQty = Number(recipe.output?.quantity ?? 1) * count;
    const [canStore, storeMsg] = this.stockpile.canStore(country.id, recipe.output?.item_id, outputQty);
    if (!canStore) return [false, storeMsg, null];
    return [true, 'Produção nacional disponível.', { country, territory, recipe, count, level }];
  }

  produce(userId, territoryId, recipeId, amount = 1) {
    const [ok, msg, ctx] = this.canProduce(userId, territoryId, recipeId, amount);
    if (!ok) return [false, msg, null];
    const consumed = [];
    for (const [itemId, q] of Object.entries(ctx.recipe.inputs ?? {})) {
      const qty = Number(q) * ctx.count;
      const [removed] = this.stockpile.remove(ctx.country.id, itemId, qty);
      if (!removed) {
        for (const c of consumed) this.stockpile.add(ctx.country.id, c.item_id, c.quantity, 50);
        return [false, 'Falha ao consumir materiais do estoque nacional. Operação revertida.', null];
      }
      consumed.push({ item_id: itemId, quantity: qty });
    }

    const baseQty = Number(ctx.recipe.output?.quantity ?? 1) * ctx.count;
    const bonus = this.technologies.productionBonus(ctx.country.id);
    const bonusQty = Math.floor(baseQty * bonus);
    const outputQty = baseQty + bonusQty;
    const outputId = ctx.recipe.output.item_id;
    const quality = Math.max(1, Math.min(100, Math.trunc(Number(ctx.recipe.base_quality ?? 50) + Math.max(0, ctx.level - 1) * 2)));
    const [added, addMsg] = this.stockpile.add(ctx.country.id, outputId, outputQty, quality);
    if (!added) {
      for (const c of consumed) this.stockpile.add(ctx.country.id, c.item_id, c.quantity, 50);
      return [false, `${addMsg} Operação revertida.`, null];
    }

    const result = { country_id: ctx.country.id, territory_id: ctx.territory.id, recipe_id: ctx.recipe.id, item_id: outputId, base_quantity: baseQty, bonus_quantity: bonusQty, quantity: outputQty, quality, complex_level: ctx.level };
    this.record({ type: 'production', user_id: String(userId), ...result });
    return [true, bonusQty > 0 ? `Produção concluída com bônus industrial de +${bonusQty}.` : 'Produção militar nacional concluída.', result];
  }

  history(countryId, limit = 20) {
    return JsonManager.load(HISTORY, []).filter((x) => x.country_id === String(countryId)).slice(-Math.max(1, Number(limit) || 20)).reverse().map(clone);
  }
}

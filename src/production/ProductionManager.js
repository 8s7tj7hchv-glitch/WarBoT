import { InventoryManager } from '../inventory/InventoryManager.js';
import { ProfileManager } from '../players/ProfileManager.js';
import { EnergyManager } from '../players/EnergyManager.js';
import { StatisticsManager } from '../players/StatisticsManager.js';
import { RecipeRegistry } from './RecipeRegistry.js';
import { ProductionRequirements } from './ProductionRequirements.js';
import { EquipmentService } from '../equipment/EquipmentService.js';

export class ProductionManager {
  constructor({ inventory, profiles, energy, statistics, recipes, requirements } = {}) {
    this.inventory = inventory ?? new InventoryManager();
    this.profiles = profiles ?? new ProfileManager();
    this.energy = energy ?? new EnergyManager(this.profiles);
    this.statistics = statistics ?? new StatisticsManager();
    this.recipes = recipes ?? new RecipeRegistry();
    this.requirements = requirements ?? new ProductionRequirements();
    this.equipment = new EquipmentService();
  }

  canCraft(userId, recipeId, amount = 1) {
    const count = Math.trunc(Number(amount));
    if (!Number.isInteger(count) || count <= 0) return [false, 'Quantidade inválida.'];
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return [false, 'Receita não encontrada.'];

    const [infraOk, infraMessage] = this.requirements.check(userId, String(recipe.category ?? ''));
    if (!infraOk) return [false, infraMessage];

    const profile = this.profiles.get(userId);
    if (!profile) return [false, 'Perfil não encontrado. Use /game primeiro.'];
    const requiredLevel = Math.trunc(Number(recipe.required_level ?? 1));
    if (Math.trunc(Number(profile.level ?? 1)) < requiredLevel) return [false, `Nível ${requiredLevel} necessário.`];

    const rawEnergy = Math.trunc(Number(recipe.energy_cost ?? 0)) * count;
    const energyCost = this.requirements.discountedEnergy(userId, rawEnergy);
    if (!this.energy.has(userId, energyCost)) return [false, 'Energia insuficiente.'];

    for (const [itemId, qty] of Object.entries(recipe.inputs ?? {})) {
      const needed = Math.trunc(Number(qty)) * count;
      if (!this.inventory.hasItem(userId, itemId, needed)) return [false, `Falta o item: ${itemId} (${needed}).`];
    }

    const output = recipe.output ?? {};
    const outputId = String(output.item_id ?? '');
    if (!outputId) return [false, 'Produto de saída inválido.'];
    const outputQuantity = Math.trunc(Number(output.quantity ?? 1)) * count;
    const inventory = this.inventory.get(userId);
    if (!this.inventory.storage.canStore(inventory, outputId, outputQuantity)) return [false, 'Capacidade insuficiente para o produto.'];
    return [true, 'Produção disponível.'];
  }

  craft(userId, recipeId, amount = 1) {
    const count = Math.trunc(Number(amount));
    const [allowed, message] = this.canCraft(userId, recipeId, count);
    if (!allowed) return [false, message, null];
    const recipe = this.recipes.get(recipeId);
    const consumed = [];

    for (const [itemId, qty] of Object.entries(recipe.inputs ?? {})) {
      const needed = Math.trunc(Number(qty)) * count;
      const [ok] = this.inventory.removeItem(userId, itemId, needed);
      if (!ok) {
        for (const item of consumed) this.inventory.addItem(userId, item.itemId, item.quantity, item.quality);
        return [false, `Não foi possível consumir o ingrediente: ${itemId}.`, null];
      }
      consumed.push({ itemId, quantity: needed, quality: 50 });
    }

    const rawEnergy = Math.trunc(Number(recipe.energy_cost ?? 0)) * count;
    const energyCost = this.requirements.discountedEnergy(userId, rawEnergy);
    if (energyCost > 0 && !this.energy.consume(userId, energyCost)) {
      for (const item of consumed) this.inventory.addItem(userId, item.itemId, item.quantity, item.quality);
      return [false, 'Falha ao consumir energia.', null];
    }

    const outputId = String(recipe.output.item_id);
    const outputQuantity = Math.trunc(Number(recipe.output.quantity ?? 1)) * count;
    const quality = Math.max(1, Math.min(100, Math.trunc(Number(recipe.base_quality ?? 50))));
    const [added, addMessage] = this.inventory.addItem(userId, outputId, outputQuantity, quality);
    if (!added) {
      if (energyCost > 0) this.energy.add(userId, energyCost);
      for (const item of consumed) this.inventory.addItem(userId, item.itemId, item.quantity, item.quality);
      return [false, `${addMessage} A operação foi revertida.`, null];
    }

    this.equipment.createInstances(userId, outputId, outputQuantity, quality);
    this.statistics.increment(userId, 'items_produced', outputQuantity);
    this.statistics.increment(userId, 'production_jobs', 1);
    return [true, 'Produção concluída.', { recipe_id: recipeId, item_id: outputId, quantity: outputQuantity, quality, energy_used: energyCost }];
  }
}

export class WealthManager {
  constructor({ economy, inventory, storage, items } = {}) {
    this.economy = economy ?? null;
    this.inventory = inventory ?? null;
    this.storage = storage ?? null;
    this.items = items ?? null;
  }

  _requireDependencies() {
    const missing = [];
    if (!this.economy) missing.push('economy');
    if (!this.inventory) missing.push('inventory');
    if (!this.storage) missing.push('storage');
    if (!this.items) missing.push('items');
    if (missing.length) throw new Error(`WealthManager aguardando módulos: ${missing.join(', ')}`);
  }

  _itemsValue(items) {
    this._requireDependencies();
    let total = 0;
    for (const item of items ?? []) {
      const itemId = String(item?.id ?? '');
      const quantity = Math.max(0, Math.trunc(Number(item?.quantity ?? 0)));
      total += Number(this.items.getBasePrice(itemId) ?? 0) * quantity;
    }
    return Math.round(total * 100) / 100;
  }

  inventoryValue(userId) { return this._itemsValue(this.inventory.listItems(userId)); }
  warehouseValue(userId) { return this._itemsValue(this.storage.listItems(userId, 'warehouse')); }
  industrialValue(userId) { return this._itemsValue(this.storage.listItems(userId, 'industrial')); }
  garageValue(userId) { return this._itemsValue(this.storage.listItems(userId, 'garage')); }

  calculate(userId) {
    this._requireDependencies();
    const balances = this.economy.balances(userId);
    const inventory = this.inventoryValue(userId);
    const warehouse = this.warehouseValue(userId);
    const industrial = this.industrialValue(userId);
    const garage = this.garageValue(userId);
    const itemAssets = inventory + warehouse + industrial + garage;

    return {
      wallet: Number(balances.wallet ?? 0),
      bank: Number(balances.bank ?? 0),
      inventory,
      warehouse,
      industrial,
      garage,
      item_assets: Math.round(itemAssets * 100) / 100,
      total: Math.round((Number(balances.wallet ?? 0) + Number(balances.bank ?? 0) + itemAssets) * 100) / 100
    };
  }
}

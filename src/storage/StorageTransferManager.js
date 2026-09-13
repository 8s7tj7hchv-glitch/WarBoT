import { ItemRegistry } from '../core/ItemRegistry.js';
import { InventoryManager } from '../inventory/InventoryManager.js';
import { StorageManager } from './StorageManager.js';

function averageQuality(items, itemId) {
  return Math.trunc(Number(items.find((item) => item.id === itemId)?.quality ?? 50));
}

export class StorageTransferManager {
  constructor(itemRegistry = new ItemRegistry()) {
    this.inventory = new InventoryManager(undefined, itemRegistry);
    this.storage = new StorageManager(undefined, itemRegistry);
  }

  inventoryToStorage(userId, storageType, itemId, quantity) {
    const amount = Math.trunc(Number(quantity));
    if (!Number.isInteger(amount) || amount <= 0) return [false, 'Quantidade inválida.'];
    if (!this.inventory.hasItem(userId, itemId, amount)) return [false, 'Você não possui essa quantidade.'];

    const [allowed, message] = this.storage.canStore(userId, storageType, itemId, amount);
    if (!allowed) return [false, message];

    const quality = averageQuality(this.inventory.listItems(userId), itemId);
    const [removed, removeMessage] = this.inventory.removeItem(userId, itemId, amount);
    if (!removed) return [false, removeMessage];

    const [added, addMessage] = this.storage.addItem(userId, storageType, itemId, amount, quality);
    if (!added) {
      this.inventory.addItem(userId, itemId, amount, quality);
      return [false, addMessage];
    }

    return [true, 'Transferência concluída.'];
  }

  storageToInventory(userId, storageType, itemId, quantity) {
    const amount = Math.trunc(Number(quantity));
    if (!Number.isInteger(amount) || amount <= 0) return [false, 'Quantidade inválida.'];
    if (this.storage.getQuantity(userId, storageType, itemId) < amount) return [false, 'Quantidade insuficiente no armazenamento.'];

    const quality = averageQuality(this.storage.listItems(userId, storageType), itemId);
    const inventory = this.inventory.get(userId);
    if (!this.inventory.storage.canStore(inventory, itemId, amount)) return [false, 'Seu inventário não possui espaço.'];

    const [removed, removeMessage] = this.storage.removeItem(userId, storageType, itemId, amount);
    if (!removed) return [false, removeMessage];

    const [added, addMessage] = this.inventory.addItem(userId, itemId, amount, quality);
    if (!added) {
      this.storage.addItem(userId, storageType, itemId, amount, quality);
      return [false, addMessage];
    }

    return [true, 'Transferência concluída.'];
  }
}

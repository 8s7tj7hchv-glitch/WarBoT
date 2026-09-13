import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { ECONOMY_DATA_DIR, START_WALLET } from '../config/settings.js';

const WALLETS_FILE = path.join(ECONOMY_DATA_DIR, 'wallets.json');

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 100) / 100;
}

export class WalletManager {
  constructor(filePath = WALLETS_FILE) {
    this.path = filePath;
    JsonManager.ensureFile(this.path, {});
  }

  key(userId) {
    return String(userId);
  }

  loadAll() {
    const data = JsonManager.load(this.path, {});
    return data && !Array.isArray(data) && typeof data === 'object' ? data : {};
  }

  saveAll(data) {
    JsonManager.save(this.path, data);
  }

  create(userId) {
    const data = this.loadAll();
    const key = this.key(userId);

    if (key in data) return money(data[key]);

    data[key] = money(START_WALLET);
    this.saveAll(data);
    return data[key];
  }

  getBalance(userId) {
    const data = this.loadAll();
    const key = this.key(userId);
    return key in data ? money(data[key]) : this.create(userId);
  }

  setBalance(userId, amount) {
    const value = Math.max(0, money(amount));
    const data = this.loadAll();
    data[this.key(userId)] = value;
    this.saveAll(data);
    return value;
  }

  add(userId, amount) {
    const value = money(amount);
    if (value <= 0) return this.getBalance(userId);
    return this.setBalance(userId, this.getBalance(userId) + value);
  }

  remove(userId, amount) {
    const value = money(amount);
    if (value <= 0) return false;

    const balance = this.getBalance(userId);
    if (balance < value) return false;

    this.setBalance(userId, balance - value);
    return true;
  }

  // Compatibilidade com nomes usados na versão Python/documentação antiga.
  get_balance(userId) { return this.getBalance(userId); }
  set_balance(userId, amount) { return this.setBalance(userId, amount); }
}

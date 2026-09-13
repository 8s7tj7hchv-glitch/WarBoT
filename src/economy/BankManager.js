import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { ECONOMY_DATA_DIR, START_BANK } from '../config/settings.js';
import { WalletManager } from './WalletManager.js';

const BANKS_FILE = path.join(ECONOMY_DATA_DIR, 'banks.json');

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 100) / 100;
}

export class BankManager {
  constructor(filePath = BANKS_FILE, walletManager = new WalletManager()) {
    this.path = filePath;
    this.wallet = walletManager;
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

    data[key] = money(START_BANK);
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

  deposit(userId, amount) {
    const value = money(amount);
    if (value <= 0) return false;
    if (!this.wallet.remove(userId, value)) return false;

    try {
      this.setBalance(userId, this.getBalance(userId) + value);
      return true;
    } catch (error) {
      this.wallet.add(userId, value);
      throw error;
    }
  }

  withdraw(userId, amount) {
    const value = money(amount);
    if (value <= 0) return false;

    const bankBalance = this.getBalance(userId);
    if (bankBalance < value) return false;

    this.setBalance(userId, bankBalance - value);

    try {
      this.wallet.add(userId, value);
      return true;
    } catch (error) {
      this.setBalance(userId, bankBalance);
      throw error;
    }
  }

  get_balance(userId) { return this.getBalance(userId); }
  set_balance(userId, amount) { return this.setBalance(userId, amount); }
}

import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { ECONOMY_DATA_DIR } from '../config/settings.js';

const TRANSACTIONS_FILE = path.join(ECONOMY_DATA_DIR, 'transactions.json');

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 100) / 100;
}

export class TransactionManager {
  constructor(filePath = TRANSACTIONS_FILE) {
    this.path = filePath;
    JsonManager.ensureFile(this.path, []);
  }

  loadAll() {
    const data = JsonManager.load(this.path, []);
    return Array.isArray(data) ? data : [];
  }

  saveAll(data) {
    JsonManager.save(this.path, data);
  }

  register({ type, amount, userId, targetId = null, description = null }) {
    const transactions = this.loadAll();
    const transaction = {
      id: randomUUID().replaceAll('-', ''),
      type: String(type),
      amount: money(amount),
      user_id: String(userId),
      target_id: targetId === null || targetId === undefined ? null : String(targetId),
      description,
      created_at: new Date().toISOString()
    };

    transactions.push(transaction);
    this.saveAll(transactions);
    return structuredClone(transaction);
  }

  getUserHistory(userId, limit = 20) {
    const key = String(userId);
    const safeLimit = Math.max(1, Math.trunc(Number(limit) || 20));

    return this.loadAll()
      .filter((item) => String(item?.user_id ?? '') === key || String(item?.target_id ?? '') === key)
      .slice(-safeLimit)
      .reverse()
      .map((item) => structuredClone(item));
  }

  get_user_history(userId, limit = 20) {
    return this.getUserHistory(userId, limit);
  }
}

import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { PLAYERS_DATA_DIR } from '../config/settings.js';

export const STATISTICS_FILE = path.join(PLAYERS_DATA_DIR, 'statistics.json');

export const DEFAULT_STATISTICS = Object.freeze({
  resources_collected: 0,
  items_produced: 0,
  items_sold: 0,
  items_bought: 0,
  money_earned: 0,
  money_spent: 0,
  transactions: 0,
  production_jobs: 0,
  distance_traveled: 0,
  profession_actions: 0
});

function clone(value) {
  return structuredClone(value);
}

export class StatisticsManager {
  constructor(filePath = STATISTICS_FILE) {
    this.path = filePath;
    JsonManager.ensureFile(this.path, {});
  }

  static key(userId) {
    return String(userId);
  }

  _loadAll() {
    const data = JsonManager.load(this.path, {});
    if (data === null || Array.isArray(data) || typeof data !== 'object') return {};
    return data;
  }

  _saveAll(data) {
    JsonManager.save(this.path, data);
  }

  create(userId) {
    const data = this._loadAll();
    const key = StatisticsManager.key(userId);

    if (key in data) return clone(data[key]);

    data[key] = clone(DEFAULT_STATISTICS);
    this._saveAll(data);
    return clone(data[key]);
  }

  get(userId) {
    const data = this._loadAll();
    const key = StatisticsManager.key(userId);

    if (!(key in data)) return this.create(userId);

    return {
      ...clone(DEFAULT_STATISTICS),
      ...clone(data[key])
    };
  }

  save(userId, statistics) {
    const data = this._loadAll();
    data[StatisticsManager.key(userId)] = clone(statistics);
    this._saveAll(data);
  }

  increment(userId, field, amount = 1) {
    const statistics = this.get(userId);
    const current = Number(statistics[field]);
    const increment = Number(amount);

    statistics[field] = (Number.isFinite(current) ? current : 0) +
      (Number.isFinite(increment) ? increment : 0);

    this.save(userId, statistics);
    return statistics[field];
  }

  setValue(userId, field, value) {
    const statistics = this.get(userId);
    statistics[field] = value;
    this.save(userId, statistics);
  }
}

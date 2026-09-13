import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import {
  PLAYERS_DATA_DIR,
  START_LEVEL,
  START_XP,
  START_ENERGY
} from '../config/settings.js';

export const PLAYERS_FILE = path.join(PLAYERS_DATA_DIR, 'players.json');

export const DEFAULT_PROFILE = Object.freeze({
  user_id: '0',
  username: '',
  level: START_LEVEL,
  xp: START_XP,
  energy: START_ENERGY,
  profession: null,
  country: null,
  territory: null,
  created_at: null,
  last_seen: null
});

function clone(value) {
  return structuredClone(value);
}

export class ProfileManager {
  constructor(filePath = PLAYERS_FILE) {
    this.path = filePath;
    JsonManager.ensureFile(this.path, {});
  }

  static now() {
    return new Date().toISOString();
  }

  static key(userId) {
    return String(userId);
  }

  _loadAll() {
    const data = JsonManager.load(this.path, {});
    if (data === null || Array.isArray(data) || typeof data !== 'object') {
      return {};
    }
    return data;
  }

  _saveAll(data) {
    JsonManager.save(this.path, data);
  }

  exists(userId) {
    return ProfileManager.key(userId) in this._loadAll();
  }

  create(userId, username) {
    const players = this._loadAll();
    const key = ProfileManager.key(userId);

    if (key in players) {
      const existing = { ...clone(players[key]), user_id: key };
      if (players[key]?.user_id !== key) {
        players[key] = existing;
        this._saveAll(players);
      }
      return clone(existing);
    }

    const now = ProfileManager.now();
    const profile = {
      ...clone(DEFAULT_PROFILE),
      user_id: String(userId),
      username: String(username ?? ''),
      created_at: now,
      last_seen: now
    };

    players[key] = profile;
    this._saveAll(players);
    return clone(profile);
  }

  get(userId) {
    const players = this._loadAll();
    const key = ProfileManager.key(userId);
    const profile = players[key];
    if (!profile) return null;
    return { ...clone(profile), user_id: key };
  }

  getOrCreate(userId, username) {
    let profile = this.get(userId);
    if (!profile) {
      return this.create(userId, username);
    }

    const normalizedUsername = String(username ?? '');
    if (profile.username !== normalizedUsername) {
      profile.username = normalizedUsername;
    }

    profile.last_seen = ProfileManager.now();
    this.saveProfile(userId, profile);
    return clone(profile);
  }

  saveProfile(userId, profile) {
    const players = this._loadAll();
    const key = ProfileManager.key(userId);

    players[key] = {
      ...clone(profile),
      user_id: String(userId)
    };

    this._saveAll(players);
  }

  setField(userId, field, value) {
    const profile = this.get(userId);
    if (!profile) return false;

    profile[field] = value;
    profile.last_seen = ProfileManager.now();
    this.saveProfile(userId, profile);
    return true;
  }

  getField(userId, field, defaultValue = null) {
    const profile = this.get(userId);
    if (!profile) return defaultValue;
    return profile[field] ?? defaultValue;
  }

  delete(userId) {
    const players = this._loadAll();
    const key = ProfileManager.key(userId);
    if (!(key in players)) return false;

    delete players[key];
    this._saveAll(players);
    return true;
  }
}

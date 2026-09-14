import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { DATA_DIR } from '../config/settings.js';
import { assertBotOwner } from './OwnerAccess.js';

const DIR = path.join(DATA_DIR, 'owner');
const FILE = path.join(DIR, 'pro_players.json');

const now = () => new Date().toISOString();
const clone = value => structuredClone(value);

export class VipManager {
  constructor() {
    JsonManager.ensureFile(FILE, {});
  }

  load() {
    const data = JsonManager.load(FILE, {});
    return data && !Array.isArray(data) && typeof data === 'object' ? data : {};
  }

  save(data) {
    JsonManager.save(FILE, data);
  }

  grant({ actorId, userId, days = null }) {
    assertBotOwner(actorId);
    const uid = String(userId ?? '').replace(/\D/g, '');
    if (!uid) throw new Error('ID do jogador inválido.');

    const parsedDays = days === null || days === '' ? null : Number(days);
    if (parsedDays !== null && (!Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 36500)) {
      throw new Error('A duração deve ficar entre 1 e 36500 dias, ou ficar vazia para permanente.');
    }

    const grantedAt = now();
    const expiresAt = parsedDays === null
      ? null
      : new Date(Date.now() + parsedDays * 86400000).toISOString();

    const all = this.load();
    all[uid] = {
      user_id: uid,
      tier: 'pro',
      granted_by: String(actorId),
      granted_at: grantedAt,
      expires_at: expiresAt,
      active: true
    };
    this.save(all);
    return clone(all[uid]);
  }

  revoke({ actorId, userId }) {
    assertBotOwner(actorId);
    const uid = String(userId ?? '').replace(/\D/g, '');
    const all = this.load();
    if (!all[uid]) return false;
    delete all[uid];
    this.save(all);
    return true;
  }

  get(userId) {
    const uid = String(userId ?? '');
    const entry = this.load()[uid];
    if (!entry || entry.active === false) return null;
    if (entry.expires_at && new Date(entry.expires_at).getTime() <= Date.now()) return null;
    return clone(entry);
  }

  isPro(userId) {
    return Boolean(this.get(userId));
  }

  listActive() {
    return Object.values(this.load())
      .filter(entry => entry?.active !== false)
      .filter(entry => !entry.expires_at || new Date(entry.expires_at).getTime() > Date.now())
      .map(clone);
  }
}

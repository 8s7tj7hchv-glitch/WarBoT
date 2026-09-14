import crypto from 'node:crypto';
import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { DATA_DIR } from '../config/settings.js';
import { assertBotOwner } from './OwnerAccess.js';

const DIR = path.join(DATA_DIR, 'owner');
const CATALOG = path.join(DIR, 'exclusive_force_catalog.json');
const FORCES = path.join(DIR, 'exclusive_forces.json');
const clone = value => structuredClone(value);

export class ExclusiveForcesManager {
  constructor() {
    JsonManager.ensureFile(CATALOG, []);
    JsonManager.ensureFile(FORCES, []);
  }

  catalog() {
    const data = JsonManager.load(CATALOG, []);
    return Array.isArray(data) ? data.map(clone) : [];
  }

  list() {
    const data = JsonManager.load(FORCES, []);
    return Array.isArray(data) ? data.map(clone) : [];
  }

  getTemplate(templateId) {
    return this.catalog().find(item => item.id === String(templateId)) ?? null;
  }

  create({ actorId, templateId, nickname = null }) {
    assertBotOwner(actorId);
    const template = this.getTemplate(templateId);
    if (!template) throw new Error('Força exclusiva não encontrada no catálogo.');

    const force = {
      id: `owner_force_${crypto.randomUUID()}`,
      template_id: template.id,
      owner_id: String(actorId),
      name: String(nickname || template.name).trim().slice(0, 60),
      category: template.category,
      game_stats: clone(template.gameStats),
      readiness: 100,
      active: true,
      created_at: new Date().toISOString()
    };

    const all = this.list();
    all.push(force);
    JsonManager.save(FORCES, all);
    return clone(force);
  }

  remove({ actorId, forceId }) {
    assertBotOwner(actorId);
    const all = this.list();
    const next = all.filter(item => item.id !== String(forceId));
    if (next.length === all.length) return false;
    JsonManager.save(FORCES, next);
    return true;
  }

  ownerForces(ownerId) {
    return this.list().filter(item => item.owner_id === String(ownerId) && item.active !== false);
  }
}

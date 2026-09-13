import path from 'node:path';
import crypto from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { GLOBAL_WAR_DATA_DIR } from '../config/settings.js';

const FILE = path.join(GLOBAL_WAR_DATA_DIR, 'world_events.json');
const CONFIG = path.join(GLOBAL_WAR_DATA_DIR, 'world_config.json');
const clone = (v) => structuredClone(v);
const CATALOG = Object.freeze([
  { type: 'supply_shock', name: 'Choque de Suprimentos', emoji: '📦', effects: { production: -0.08, logistics: -0.12, market_volatility: 0.18 } },
  { type: 'trade_boom', name: 'Expansão Comercial', emoji: '📈', effects: { production: 0.05, logistics: 0.08, market_volatility: -0.06 } },
  { type: 'energy_strain', name: 'Pressão Energética', emoji: '⚡', effects: { production: -0.10, logistics: -0.04, market_volatility: 0.10 } },
  { type: 'reconstruction_wave', name: 'Onda de Reconstrução', emoji: '🏗️', effects: { production: 0.08, logistics: 0.04, market_volatility: -0.04 } },
  { type: 'shipping_congestion', name: 'Congestionamento Logístico', emoji: '🚚', effects: { production: -0.03, logistics: -0.15, market_volatility: 0.12 } },
  { type: 'innovation_cycle', name: 'Ciclo de Inovação', emoji: '🔬', effects: { production: 0.10, logistics: 0.02, market_volatility: 0.02 } }
]);

export class GlobalEventManager {
  constructor() { JsonManager.ensureFile(FILE, []); JsonManager.ensureFile(CONFIG, {}); }
  load() { const d = JsonManager.load(FILE, []); return Array.isArray(d) ? d : []; }
  save(d) { JsonManager.save(FILE, d); }
  catalog() { return CATALOG.map(clone); }
  list({ activeOnly = false } = {}) {
    const now = Date.now();
    return this.load().filter(e => !activeOnly || (e.status === 'active' && Date.parse(e.expires_at) > now)).map(clone);
  }
  active() { return this.list({ activeOnly: true }); }
  generate({ type = null, actorId = null, durationHours = null } = {}) {
    const cfg = JsonManager.load(CONFIG, {});
    const maxActive = Math.max(1, Number(cfg?.events?.max_active ?? 3));
    if (this.active().length >= maxActive) throw new Error('O limite de eventos mundiais ativos foi atingido.');
    let model = type ? CATALOG.find(x => x.type === String(type)) : null;
    if (!model) model = CATALOG[crypto.randomInt(0, CATALOG.length)];
    const hours = Math.max(1, Math.min(168, Math.trunc(Number(durationHours ?? cfg?.events?.default_duration_hours ?? 24))));
    const now = new Date();
    const event = {
      id: `world_event_${crypto.randomUUID()}`,
      type: model.type,
      name: model.name,
      emoji: model.emoji,
      effects: clone(model.effects),
      status: 'active',
      created_by: actorId ? String(actorId) : null,
      created_at: now.toISOString(),
      expires_at: new Date(now.getTime() + hours * 3600000).toISOString()
    };
    const all = this.load(); all.push(event); this.save(all); return clone(event);
  }
  modifiers() {
    const total = { production: 0, logistics: 0, market_volatility: 0 };
    for (const e of this.active()) for (const key of Object.keys(total)) total[key] += Number(e.effects?.[key] ?? 0);
    return total;
  }
}

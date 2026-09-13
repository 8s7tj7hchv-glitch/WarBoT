import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { WORLD_DATA_DIR } from '../config/settings.js';
import { TerritoryManager } from './TerritoryManager.js';
const HISTORY = path.join(WORLD_DATA_DIR, 'infrastructure_history.json');
const TYPES = new Set(['roads', 'rail', 'port', 'power', 'communications', 'industry']);
export class InfrastructureManager {
  constructor({ territories = new TerritoryManager() } = {}) { this.territories = territories; JsonManager.ensureFile(HISTORY, []); }
  get(territoryId) { return this.territories.get(territoryId)?.infrastructure ?? null; }
  score(territoryId) { const i = this.get(territoryId); return i ? Object.values(i).reduce((a, b) => a + Number(b || 0), 0) : 0; }
  upgrade(territoryId, type, { countryId, userId } = {}) {
    if (!TYPES.has(String(type))) throw new Error('Tipo de infraestrutura inválido.');
    const t = this.territories.get(territoryId); if (!t) throw new Error('Território não encontrado.');
    if (countryId && t.controller_country_id !== String(countryId)) throw new Error('Seu país não controla este território.');
    const current = Number(t.infrastructure?.[type] ?? 0); if (current >= 5) throw new Error('Infraestrutura já está no nível máximo.');
    const updated = this.territories.update(territoryId, { infrastructure: { ...(t.infrastructure ?? {}), [type]: current + 1 } });
    const history = JsonManager.load(HISTORY, []); history.push({ territory_id: t.id, type: String(type), from_level: current, to_level: current + 1, country_id: countryId ?? null, user_id: String(userId ?? ''), created_at: new Date().toISOString() }); JsonManager.save(HISTORY, history);
    return updated;
  }
}

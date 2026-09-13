import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { WORLD_DATA_DIR } from '../config/settings.js';
const FILE = path.join(WORLD_DATA_DIR, 'borders.json');
export class BorderManager {
  constructor() { JsonManager.ensureFile(FILE, {}); }
  load() { const d = JsonManager.load(FILE, {}); return d && !Array.isArray(d) && typeof d === 'object' ? d : {}; }
  neighbors(territoryId) { return [...(this.load()[String(territoryId)] ?? [])]; }
  areAdjacent(a, b) { return this.neighbors(a).includes(String(b)); }
  listEdges() { const d = this.load(), seen = new Set(), out = []; for (const [a, ns] of Object.entries(d)) for (const b of ns) { const k = [a, b].sort().join('|'); if (!seen.has(k)) { seen.add(k); out.push([a, b]); } } return out; }
}

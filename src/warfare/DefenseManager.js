import { UnitManager } from '../military/UnitManager.js';
import { MilitaryAssetManager } from '../military/MilitaryAssetManager.js';
import { InfrastructureManager } from '../world/InfrastructureManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';

export class DefenseManager {
  constructor({ units = new UnitManager(), assets = new MilitaryAssetManager(), infrastructure = new InfrastructureManager(), territories = new TerritoryManager() } = {}) { this.units = units; this.assets = assets; this.infrastructure = infrastructure; this.territories = territories; }
  territoryDefense(territoryId, countryId) {
    const t = this.territories.get(territoryId); if (!t) throw new Error('Território não encontrado.');
    const cid = String(countryId);
    const units = this.units.list(cid).filter(u => u.territory_id === t.id && u.status === 'active');
    const assets = this.assets.list(cid).filter(a => a.territory_id === t.id && a.status === 'active');
    const unitScore = units.reduce((s,u) => s + (Number(u.game_stats?.defense ?? 0) * (Number(u.readiness ?? 0)/100) * (0.75 + Number(u.morale ?? 50)/200)), 0);
    const assetScore = assets.reduce((s,a) => s + 10 * (Number(a.readiness ?? 0)/100) * (Number(a.condition ?? 100)/100), 0);
    const infrastructure = this.infrastructure.score(t.id) * 2;
    const terrainBonus = ({ mountain: 10, forest: 7, urban: 8, islands: 6, coast: 4 }[t.terrain] ?? 3);
    return { territory: t, units, assets, unit_score: unitScore, asset_score: assetScore, infrastructure_score: infrastructure, terrain_bonus: terrainBonus, total: unitScore + assetScore + infrastructure + terrainBonus };
  }
}

import { UnitManager } from '../military/UnitManager.js';
import { MilitaryAssetManager } from '../military/MilitaryAssetManager.js';
import { BorderManager } from '../world/BorderManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';

export class AttackManager {
  constructor({ units = new UnitManager(), assets = new MilitaryAssetManager(), borders = new BorderManager(), territories = new TerritoryManager() } = {}) { this.units = units; this.assets = assets; this.borders = borders; this.territories = territories; }
  validate({ countryId, originTerritoryId, targetTerritoryId, unitIds = [] }) {
    const o = this.territories.get(originTerritoryId), t = this.territories.get(targetTerritoryId), cid = String(countryId);
    if (!o || !t) throw new Error('Território de origem ou alvo não encontrado.');
    if (o.controller_country_id !== cid) throw new Error('O país atacante precisa controlar o território de origem.');
    if (t.controller_country_id === cid) throw new Error('O alvo já é controlado pelo país atacante.');
    if (!this.borders.areAdjacent(o.id, t.id)) throw new Error('O ataque só pode ocorrer entre territórios adjacentes.');
    const chosen = unitIds.map(id => this.units.get(id)).filter(Boolean);
    if (!chosen.length) throw new Error('Selecione pelo menos uma unidade atacante.');
    if (chosen.some(u => u.country_id !== cid || u.territory_id !== o.id || u.status !== 'active')) throw new Error('Todas as unidades precisam estar ativas e estacionadas no território de origem.');
    return { origin: o, target: t, units: chosen };
  }
  attackPower(units) {
    let score = 0;
    for (const u of units) {
      const stats = u.game_stats ?? {};
      const readiness = Number(u.readiness ?? 0)/100, morale = 0.75 + Number(u.morale ?? 50)/200, experience = 1 + Math.min(0.25, Number(u.experience ?? 0)/1000);
      score += (Number(stats.power ?? 0) + Number(stats.mobility ?? 0)*0.25 + Number(stats.support ?? 0)*0.15) * readiness * morale * experience;
    }
    return score;
  }
}

import crypto from 'node:crypto';
import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { WARFARE_DATA_DIR } from '../config/settings.js';
import { UnitManager } from '../military/UnitManager.js';
import { MilitaryAssetManager } from '../military/MilitaryAssetManager.js';
import { AttackManager } from './AttackManager.js';
import { DefenseManager } from './DefenseManager.js';
import { ConflictManager } from './ConflictManager.js';
import { TerritorialControlManager } from '../world/TerritorialControlManager.js';
import { WarEconomyManager } from './WarEconomyManager.js';

const FILE = path.join(WARFARE_DATA_DIR, 'battles.json');
const clone = v => structuredClone(v);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class BattleResolver {
  constructor({ units = new UnitManager(), assets = new MilitaryAssetManager(), attacks = new AttackManager({units,assets}), defense = new DefenseManager({units,assets}), conflicts = new ConflictManager(), control = new TerritorialControlManager(), economy = new WarEconomyManager() } = {}) { this.units=units; this.assets=assets; this.attacks=attacks; this.defense=defense; this.conflicts=conflicts; this.control=control; this.economy=economy; JsonManager.ensureFile(FILE,[]); }
  load(){const d=JsonManager.load(FILE,[]);return Array.isArray(d)?d:[]}
  list(conflictId=null){return this.load().filter(b=>!conflictId||b.conflict_id===String(conflictId)).map(clone)}
  resolve({ conflictId, attackerCountryId, originTerritoryId, targetTerritoryId, unitIds, actorId=null }) {
    const conflict=this.conflicts.get(conflictId); if(!conflict||conflict.status!=='active')throw new Error('Conflito ativo não encontrado.');
    if(conflict.attacker_country_id!==String(attackerCountryId) && conflict.defender_country_id!==String(attackerCountryId)) throw new Error('País não participa deste conflito.');
    const validated=this.attacks.validate({countryId:attackerCountryId,originTerritoryId,targetTerritoryId,unitIds});
    const defenderId=validated.target.controller_country_id; if(!defenderId) throw new Error('O alvo precisa estar sob controle de um país.');
    if(![conflict.attacker_country_id,conflict.defender_country_id].includes(defenderId)) throw new Error('O alvo não pertence ao oponente deste conflito.');
    const atkBase=this.attacks.attackPower(validated.units); const def=this.defense.territoryDefense(targetTerritoryId,defenderId);
    const atkRoll=0.9 + crypto.randomInt(0,21)/100; const defRoll=0.9 + crypto.randomInt(0,21)/100;
    const atkScore=atkBase*atkRoll, defScore=def.total*defRoll;
    const attackerWon=atkScore>defScore;
    const ratio=atkScore/Math.max(1,defScore); const intensity=clamp(Math.abs(1-ratio),0.1,1.5);
    const attackerLoss=Math.round(clamp(8 + (attackerWon?10:22)*intensity,5,40));
    const defenderLoss=Math.round(clamp(10 + (attackerWon?25:12)*intensity,5,45));
    for(const u of validated.units){this.units.update(u.id,{readiness:clamp(Number(u.readiness||0)-attackerLoss,0,100),morale:clamp(Number(u.morale||0)+(attackerWon?4:-10),0,100),experience:Number(u.experience||0)+5,status:Number(u.readiness||0)-attackerLoss<=5?'reserve':u.status});}
    for(const u of def.units){this.units.update(u.id,{readiness:clamp(Number(u.readiness||0)-defenderLoss,0,100),morale:clamp(Number(u.morale||0)+(attackerWon?-12:5),0,100),experience:Number(u.experience||0)+5,status:Number(u.readiness||0)-defenderLoss<=5?'reserve':u.status});}
    for(const a of def.assets){this.assets.update(a.id,{readiness:clamp(Number(a.readiness||0)-Math.round(defenderLoss*0.7),0,100),condition:clamp(Number(a.condition||100)-Math.round(defenderLoss*0.45),0,100)});}
    let conquered=false;
    if(attackerWon){this.control.setController(targetTerritoryId,attackerCountryId,{actorId}); conquered=true;}
    const battle={id:`battle_${crypto.randomUUID()}`,conflict_id:conflict.id,attacker_country_id:String(attackerCountryId),defender_country_id:defenderId,origin_territory_id:validated.origin.id,target_territory_id:validated.target.id,attacker_unit_ids:validated.units.map(u=>u.id),defender_unit_ids:def.units.map(u=>u.id),attacker_score:Number(atkScore.toFixed(2)),defender_score:Number(defScore.toFixed(2)),winner_country_id:attackerWon?String(attackerCountryId):defenderId,attacker_readiness_loss:attackerLoss,defender_readiness_loss:defenderLoss,territory_conquered:conquered,created_at:new Date().toISOString()};
    const all=this.load();all.push(battle);JsonManager.save(FILE,all);
    this.conflicts.addBattleResult(conflict.id,{winnerCountryId:battle.winner_country_id,attackerPoints:attackerWon?3:0,defenderPoints:attackerWon?0:3});
    this.economy.recordBattle(battle);
    return clone(battle);
  }
}

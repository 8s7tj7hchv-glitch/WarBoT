import path from 'node:path';
import crypto from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { GLOBAL_WAR_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { AllianceManager } from '../diplomacy/AllianceManager.js';
import { ConflictManager } from '../warfare/ConflictManager.js';
import { BattleResolver } from '../warfare/BattleResolver.js';

const FILE = path.join(GLOBAL_WAR_DATA_DIR, 'world_wars.json');
const clone = v => structuredClone(v);

export class WorldWarManager {
  constructor({ countries = new CountryManager(), alliances = new AllianceManager(), conflicts = new ConflictManager(), battles = new BattleResolver() } = {}) {
    this.countries = countries; this.alliances = alliances; this.conflicts = conflicts; this.battles = battles; JsonManager.ensureFile(FILE, []);
  }
  load() { const d = JsonManager.load(FILE, []); return Array.isArray(d) ? d : []; }
  save(d) { JsonManager.save(FILE, d); }
  get(id) { return clone(this.load().find(w => w.id === String(id)) ?? null); }
  list({ status = null, countryId = null } = {}) {
    const cid = countryId ? String(countryId) : null;
    return this.load().filter(w => (!status || w.status === status) && (!cid || w.side_a.country_ids.includes(cid) || w.side_b.country_ids.includes(cid))).map(clone);
  }
  activeForCountry(countryId) { return this.list({ status: 'active', countryId })[0] ?? null; }
  sideFor(war, countryId) { const cid = String(countryId); if (war.side_a.country_ids.includes(cid)) return 'a'; if (war.side_b.country_ids.includes(cid)) return 'b'; return null; }
  buildSide(countryId, label) {
    const country = this.countries.get(countryId); if (!country) throw new Error('País não encontrado.');
    const alliance = this.alliances.countryAlliance(country.id);
    const countryIds = alliance ? [...new Set(alliance.member_country_ids)] : [country.id];
    return { label: alliance ? `${alliance.name} [${alliance.tag}]` : label ?? country.name, alliance_id: alliance?.id ?? null, country_ids: countryIds };
  }
  start({ initiatorCountryId, targetCountryId, actorId, name = 'Guerra Mundial', reason = 'Escalada internacional' }) {
    const initiator = this.countries.get(initiatorCountryId), target = this.countries.get(targetCountryId);
    if (!initiator || !target) throw new Error('País iniciador ou alvo não encontrado.');
    if (initiator.leader_id !== String(actorId)) throw new Error('Apenas o líder do país iniciador pode abrir uma guerra mundial.');
    if (initiator.id === target.id) throw new Error('Escolha outro país como adversário.');
    if (this.activeForCountry(initiator.id) || this.activeForCountry(target.id)) throw new Error('Um dos países já participa de uma guerra mundial ativa.');
    const sideA = this.buildSide(initiator.id, 'Coalizão A'), sideB = this.buildSide(target.id, 'Coalizão B');
    if (sideA.country_ids.some(id => sideB.country_ids.includes(id))) throw new Error('Os países pertencem ao mesmo bloco diplomático.');
    const underlying = this.conflicts.activeBetween(initiator.id, target.id) ?? this.conflicts.declare({ attackerCountryId: initiator.id, defenderCountryId: target.id, actorId, reason });
    const now = new Date().toISOString();
    const war = {
      id: `world_war_${crypto.randomUUID()}`,
      name: String(name || 'Guerra Mundial').trim().slice(0, 80),
      reason: String(reason || 'Escalada internacional').trim().slice(0, 180),
      status: 'active', side_a: sideA, side_b: sideB,
      principal_conflict_id: underlying.id,
      linked_conflict_ids: [underlying.id],
      score_a: 0, score_b: 0, battles: 0,
      started_at: now, ended_at: null, winner_side: null, created_by: String(actorId)
    };
    const all = this.load(); all.push(war); this.save(all); return this.refresh(war.id);
  }
  join({ warId, countryId, side, actorId }) {
    const all = this.load(), i = all.findIndex(w => w.id === String(warId)); if (i < 0) throw new Error('Guerra mundial não encontrada.');
    const war = all[i]; if (war.status !== 'active') throw new Error('Guerra mundial não está ativa.');
    const country = this.countries.get(countryId); if (!country || country.leader_id !== String(actorId)) throw new Error('Apenas o líder do país pode aderir.');
    if (this.sideFor(war, country.id)) throw new Error('Seu país já participa desta guerra mundial.');
    const targetSide = String(side).toLowerCase() === 'b' ? 'side_b' : 'side_a';
    const opposite = targetSide === 'side_a' ? war.side_b : war.side_a;
    const ownAlliance = this.alliances.countryAlliance(country.id);
    if (ownAlliance && opposite.country_ids.some(id => ownAlliance.member_country_ids.includes(id))) throw new Error('Seu país não pode aderir contra membros da própria aliança.');
    war[targetSide].country_ids.push(country.id); war[targetSide].country_ids = [...new Set(war[targetSide].country_ids)]; war.updated_at = new Date().toISOString(); this.save(all); return clone(war);
  }
  refresh(warId) {
    const all = this.load(), i = all.findIndex(w => w.id === String(warId)); if (i < 0) throw new Error('Guerra mundial não encontrada.');
    const war = all[i]; const a = new Set(war.side_a.country_ids), b = new Set(war.side_b.country_ids);
    const conflicts = this.conflicts.load().filter(c => (a.has(c.attacker_country_id) && b.has(c.defender_country_id)) || (b.has(c.attacker_country_id) && a.has(c.defender_country_id)));
    war.linked_conflict_ids = [...new Set(conflicts.map(c => c.id))];
    const battleList = this.battles.load().filter(x => war.linked_conflict_ids.includes(x.conflict_id));
    war.battles = battleList.length;
    war.score_a = battleList.reduce((s, x) => s + (a.has(x.winner_country_id) ? 3 : 0), 0);
    war.score_b = battleList.reduce((s, x) => s + (b.has(x.winner_country_id) ? 3 : 0), 0);
    war.updated_at = new Date().toISOString(); this.save(all); return clone(war);
  }
  end({ warId, actorId }) {
    const all = this.load(), i = all.findIndex(w => w.id === String(warId)); if (i < 0) throw new Error('Guerra mundial não encontrada.');
    const war = this.refresh(warId); const principal = this.countries.get(war.side_a.country_ids[0]);
    if (principal?.leader_id !== String(actorId)) throw new Error('Apenas o líder do bloco iniciador pode encerrar a guerra mundial.');
    const fresh = this.load(), j = fresh.findIndex(w => w.id === war.id); const winner = war.score_a === war.score_b ? 'draw' : war.score_a > war.score_b ? 'a' : 'b';
    fresh[j].status = 'ended'; fresh[j].winner_side = winner; fresh[j].ended_at = new Date().toISOString(); fresh[j].updated_at = fresh[j].ended_at; this.save(fresh); return clone(fresh[j]);
  }
}

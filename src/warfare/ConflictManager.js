import path from 'node:path';
import crypto from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { WARFARE_DATA_DIR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { DiplomaticPolicyService } from '../diplomacy/DiplomaticPolicyService.js';

const FILE = path.join(WARFARE_DATA_DIR, 'conflicts.json');
const clone = (v) => structuredClone(v);

export class ConflictManager {
  constructor({ countries = new CountryManager() } = {}) {
    this.countries = countries;
    this.diplomacy = new DiplomaticPolicyService();
    JsonManager.ensureFile(FILE, []);
  }
  load() { const d = JsonManager.load(FILE, []); return Array.isArray(d) ? d : []; }
  save(d) { JsonManager.save(FILE, d); }
  get(id) { return clone(this.load().find(x => x.id === String(id)) ?? null); }
  list({ countryId = null, status = null } = {}) {
    return this.load().filter(x => (!countryId || x.attacker_country_id === String(countryId) || x.defender_country_id === String(countryId)) && (!status || x.status === status)).map(clone);
  }
  activeBetween(a, b) {
    const A = String(a), B = String(b);
    return clone(this.load().find(x => x.status === 'active' && ((x.attacker_country_id === A && x.defender_country_id === B) || (x.attacker_country_id === B && x.defender_country_id === A))) ?? null);
  }
  declare({ attackerCountryId, defenderCountryId, actorId = null, reason = 'Disputa territorial' }) {
    const a = this.countries.get(attackerCountryId), d = this.countries.get(defenderCountryId);
    if (!a || !d) throw new Error('País atacante ou defensor não encontrado.');
    if (a.id === d.id) throw new Error('Um país não pode entrar em guerra consigo mesmo.');
    if (actorId && a.leader_id !== String(actorId)) throw new Error('Apenas o líder do país pode declarar guerra.');
    if (this.activeBetween(a.id, d.id)) throw new Error('Já existe um conflito ativo entre esses países.');
    const [allowed, policyMessage] = this.diplomacy.canDeclareWar(a.id, d.id);
    if (!allowed) throw new Error(policyMessage);
    const now = new Date().toISOString();
    const conflict = { id: `war_${crypto.randomUUID()}`, attacker_country_id: a.id, defender_country_id: d.id, reason: String(reason).trim().slice(0, 160), status: 'active', attacker_score: 0, defender_score: 0, battles: 0, started_at: now, ended_at: null, winner_country_id: null, created_by: actorId ? String(actorId) : null };
    const all = this.load(); all.push(conflict); this.save(all); return clone(conflict);
  }
  addBattleResult(conflictId, { winnerCountryId = null, attackerPoints = 0, defenderPoints = 0 } = {}) {
    const all = this.load(), i = all.findIndex(x => x.id === String(conflictId)); if (i < 0) throw new Error('Conflito não encontrado.');
    all[i].battles = Number(all[i].battles ?? 0) + 1;
    all[i].attacker_score = Number(all[i].attacker_score ?? 0) + Number(attackerPoints ?? 0);
    all[i].defender_score = Number(all[i].defender_score ?? 0) + Number(defenderPoints ?? 0);
    all[i].last_winner_country_id = winnerCountryId ? String(winnerCountryId) : null;
    this.save(all); return clone(all[i]);
  }
  end(conflictId, { actorId = null, winnerCountryId = null, reason = 'encerrado' } = {}) {
    const all = this.load(), i = all.findIndex(x => x.id === String(conflictId)); if (i < 0) throw new Error('Conflito não encontrado.');
    const c = all[i];
    if (actorId && ![this.countries.get(c.attacker_country_id)?.leader_id, this.countries.get(c.defender_country_id)?.leader_id].includes(String(actorId))) throw new Error('Apenas um dos líderes envolvidos pode encerrar o conflito.');
    c.status = 'ended'; c.ended_at = new Date().toISOString(); c.winner_country_id = winnerCountryId ? String(winnerCountryId) : null; c.end_reason = String(reason).slice(0, 120); this.save(all); return clone(c);
  }
}

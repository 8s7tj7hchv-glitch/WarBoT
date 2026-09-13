import path from 'node:path';
import crypto from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { WORLD_DATA_DIR } from '../config/settings.js';
import { ProfileManager } from '../players/ProfileManager.js';
import { GuildMarketRegistry } from '../market/GuildMarketRegistry.js';

const COUNTRIES = path.join(WORLD_DATA_DIR, 'countries.json');
const MEMBERS = path.join(WORLD_DATA_DIR, 'country_members.json');
const clone = (v) => structuredClone(v);

export class CountryManager {
  constructor({ profiles = new ProfileManager(), markets = new GuildMarketRegistry() } = {}) {
    this.profiles = profiles;
    this.markets = markets;
    JsonManager.ensureFile(COUNTRIES, []);
    JsonManager.ensureFile(MEMBERS, {});
  }

  load() { const d = JsonManager.load(COUNTRIES, []); return Array.isArray(d) ? d : []; }
  save(d) { JsonManager.save(COUNTRIES, d); }
  members() { const d = JsonManager.load(MEMBERS, {}); return d && !Array.isArray(d) && typeof d === 'object' ? d : {}; }
  saveMembers(d) { JsonManager.save(MEMBERS, d); }
  get(id) { return clone(this.load().find((x) => x.id === String(id)) ?? null); }
  getByGuild(guildId) { return clone(this.load().find((x) => x.guild_id === String(guildId)) ?? null); }
  list() { return this.load().map(clone); }

  create({ guildId, guildName, leaderId, name, code, emoji = '🏳️' }) {
    const gid = String(guildId ?? '');
    const uid = String(leaderId ?? '');
    if (!gid || !uid) throw new Error('Servidor e líder são obrigatórios.');
    if (this.getByGuild(gid)) throw new Error('Este servidor já possui um país.');

    const cleanName = String(name ?? '').trim().slice(0, 60);
    const cleanCode = String(code ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    if (cleanName.length < 3) throw new Error('O nome do país precisa ter pelo menos 3 caracteres.');
    if (cleanCode.length < 2) throw new Error('Use um código de país com 2 a 5 caracteres.');
    if (this.load().some((x) => x.code === cleanCode)) throw new Error('Código de país já utilizado.');

    const now = new Date().toISOString();
    const country = {
      id: `country_${crypto.randomUUID()}`,
      guild_id: gid,
      guild_name: String(guildName ?? 'Servidor').slice(0, 100),
      name: cleanName,
      code: cleanCode,
      emoji: String(emoji || '🏳️').slice(0, 16),
      leader_id: uid,
      capital_territory_id: null,
      treasury: 0,
      created_at: now,
      updated_at: now,
      active: true
    };

    const all = this.load(); all.push(country); this.save(all);
    const members = this.members(); members[uid] = { country_id: country.id, role: 'leader', joined_at: now }; this.saveMembers(members);
    this.profiles.setField(uid, 'country', country.id);
    this.markets.register(gid, guildName);
    return clone(country);
  }

  join(userId, countryId) {
    const uid = String(userId); const country = this.get(countryId);
    if (!country) throw new Error('País não encontrado.');
    const members = this.members();
    members[uid] = { country_id: country.id, role: country.leader_id === uid ? 'leader' : 'citizen', joined_at: new Date().toISOString() };
    this.saveMembers(members); this.profiles.setField(uid, 'country', country.id); return clone(members[uid]);
  }

  leave(userId) {
    const uid = String(userId); const members = this.members(); const current = members[uid];
    if (!current) return false;
    const country = this.get(current.country_id);
    if (country?.leader_id === uid) throw new Error('O líder deve transferir a liderança antes de sair.');
    delete members[uid]; this.saveMembers(members); this.profiles.setField(uid, 'country', null); this.profiles.setField(uid, 'territory', null); return true;
  }

  memberCountry(userId) { const m = this.members()[String(userId)]; return m ? this.get(m.country_id) : null; }
  role(userId) { return this.members()[String(userId)]?.role ?? null; }
  countMembers(countryId) { return Object.values(this.members()).filter((x) => x.country_id === String(countryId)).length; }

  setCapital(countryId, territoryId) {
    const all = this.load(); const i = all.findIndex((x) => x.id === String(countryId));
    if (i < 0) throw new Error('País não encontrado.');
    all[i].capital_territory_id = String(territoryId); all[i].updated_at = new Date().toISOString(); this.save(all); return clone(all[i]);
  }
}

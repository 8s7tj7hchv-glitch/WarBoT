import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from '../config/settings.js';

const DIR = path.join(DATA_DIR, 'bonuses');
const CATALOG_FILE = path.join(DIR, 'bonus_catalog.json');
const PLAYERS_FILE = path.join(DIR, 'player_bonuses.json');
const HISTORY_FILE = path.join(DIR, 'bonus_history.json');
const RARITY = Object.freeze({ common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 });

function ensure(file, fallback) { fs.mkdirSync(path.dirname(file), { recursive: true }); if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2)); }
function read(file, fallback) { ensure(file, fallback); try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return structuredClone(fallback); } }
function write(file, value) { ensure(file, value); fs.writeFileSync(file, JSON.stringify(value, null, 2)); }

export class BonusManager {
  catalog() { return read(CATALOG_FILE, {}); }
  getDefinition(id) { return this.catalog()[id] ?? null; }
  list(userId) { const db = read(PLAYERS_FILE, {}); return (db[String(userId)] ?? []).map(x => ({ ...x, definition: this.getDefinition(x.bonus_id) })).filter(x => x.definition); }
  active(userId) { const now = Date.now(); return this.list(userId).filter(x => !x.expires_at || new Date(x.expires_at).getTime() > now); }
  equipped(userId) { return this.active(userId).filter(x => x.equipped); }
  grant(userId, bonusId, { source='system', sourceId=null, durationDays=null, metadata={} }={}) {
    const def = this.getDefinition(bonusId); if (!def) throw new Error('Bônus inexistente.');
    const db = read(PLAYERS_FILE, {}); const key = String(userId); db[key] ??= [];
    const days = durationDays ?? def.duration_days; const now = new Date();
    const item = { id:`BON-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`, bonus_id:bonusId, rarity:def.rarity, obtained_at:now.toISOString(), expires_at:days ? new Date(now.getTime()+days*86400000).toISOString() : null, equipped:false, source, source_id:sourceId, metadata };
    db[key].push(item); write(PLAYERS_FILE, db);
    const h=read(HISTORY_FILE,[]); h.push({type:'grant',user_id:key,...item}); write(HISTORY_FILE,h);
    return { ...item, definition:def };
  }
  equip(userId, instanceId, maxSlots=3) {
    const db=read(PLAYERS_FILE,{}); const key=String(userId); const list=db[key]??[]; const item=list.find(x=>x.id===instanceId); if(!item) throw new Error('Bônus não encontrado.');
    if(item.expires_at && new Date(item.expires_at).getTime()<=Date.now()) throw new Error('Este bônus expirou.');
    if(!item.equipped && list.filter(x=>x.equipped && (!x.expires_at || new Date(x.expires_at).getTime()>Date.now())).length>=maxSlots) throw new Error(`Você só pode equipar ${maxSlots} bônus.`);
    item.equipped=true; write(PLAYERS_FILE,db); return item;
  }
  unequip(userId, instanceId) { const db=read(PLAYERS_FILE,{}); const key=String(userId); const item=(db[key]??[]).find(x=>x.id===instanceId); if(!item) throw new Error('Bônus não encontrado.'); item.equipped=false; write(PLAYERS_FILE,db); return item; }
  effects(userId) { const out={}; for(const item of this.equipped(userId)){ for(const [k,v] of Object.entries(item.definition.effects??{})) out[k]=(out[k]??0)+Number(v||0); } return out; }
  rarityRank(rarity) { return RARITY[rarity] ?? 0; }
}

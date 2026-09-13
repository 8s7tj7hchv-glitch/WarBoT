import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { INDUSTRIAL_DATA_DIR } from '../config/settings.js';
import { EconomyService } from '../economy/EconomyService.js';

const DEFINITIONS = path.join(INDUSTRIAL_DATA_DIR, 'facilities.json');
const PLAYER_FILE = path.join(INDUSTRIAL_DATA_DIR, 'player_facilities.json');
const clone = v => structuredClone(v);

export class MilitaryFacilityManager {
  constructor(){ JsonManager.ensureFile(DEFINITIONS,{}); JsonManager.ensureFile(PLAYER_FILE,{}); this.economy=new EconomyService(); }
  definitions(){ return JsonManager.load(DEFINITIONS,{}); }
  getDefinition(id){ const v=this.definitions()?.[String(id)]; return v ? clone(v) : null; }
  load(){ return JsonManager.load(PLAYER_FILE,{}); }
  getLevel(userId,id){ return Math.max(0,Math.trunc(Number(this.load()?.[String(userId)]?.[String(id)]?.level ?? 0))); }
  list(userId){ return Object.entries(this.definitions()).map(([id,d])=>({id,...clone(d),level:this.getLevel(userId,id)})); }
  upgradeCost(userId,id){ const d=this.getDefinition(id); if(!d)return null; const level=this.getLevel(userId,id); return Math.round(Number(d.base_cost||0)*(1+level*0.75)); }
  upgrade(userId,id){ const d=this.getDefinition(id); if(!d)return [false,'Instalação não encontrada.',null]; const current=this.getLevel(userId,id); if(current>=Number(d.max_level||5))return [false,'Instalação já está no nível máximo.',null]; const cost=this.upgradeCost(userId,id); if(this.economy.getBalance(userId)<cost)return [false,`Saldo insuficiente. Necessário: $${cost.toFixed(2)}`,null]; if(!this.economy.remove(userId,cost))return [false,'Não foi possível cobrar a melhoria.',null]; const all=this.load(), key=String(userId); all[key]??={}; all[key][id]={level:current+1,updated_at:new Date().toISOString()}; JsonManager.save(PLAYER_FILE,all); return [true,`${d.name} agora está no nível ${current+1}.`,{id,level:current+1,cost}]; }
}

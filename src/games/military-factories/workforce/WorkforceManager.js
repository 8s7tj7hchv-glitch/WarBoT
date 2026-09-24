import { loadIndustrialState, saveIndustrialState } from '../storage/IndustrialStore.js';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';

const ROLES = Object.freeze({
  miner: { name: 'Minerador', emoji:'⛏️', productivity: 1.00 },
  blacksmith: { name: 'Ferreiro', emoji:'🔨', productivity: 1.08 },
  builder: { name: 'Construtor', emoji:'🏗️', productivity: 1.05 },
  trucker: { name: 'Caminhoneiro', emoji:'🚚', productivity: 1.04 },
  mechanic: { name: 'Mecânico', emoji:'🔧', productivity: 1.10 },
  merchant: { name: 'Comerciante', emoji:'🏪', productivity: 1.03 }
});
const SHIFTS=Object.freeze({normal:{name:'Normal',factor:1,moraleCost:0},extended:{name:'Estendido',factor:1.15,moraleCost:3},intensive:{name:'Intensivo',factor:1.3,moraleCost:7}});
const HIRE_COST=750;
export class WorkforceManager {
  get(ownerId) {
    const state=loadIndustrialState(); state.workforce??={};
    const w=state.workforce[ownerId]??{workers:10,morale:100,profession:null,xp:0,shift:'normal',totalHired:0};
    w.shift??='normal'; w.totalHired??=0; state.workforce[ownerId]=w; saveIndustrialState(state); return w;
  }
  #mutate(ownerId,fn){const state=loadIndustrialState();state.workforce??={};const w=state.workforce[ownerId]??{workers:10,morale:100,profession:null,xp:0,shift:'normal',totalHired:0};w.shift??='normal';w.totalHired??=0;fn(w);state.workforce[ownerId]=w;saveIndustrialState(state);return w;}
  setProfession(ownerId, professionId) { if(professionId&&!ROLES[professionId])throw new Error('Profissão industrial inválida.'); return this.#mutate(ownerId,w=>{w.profession=professionId||null;}); }
  setShift(ownerId,shift){if(!SHIFTS[shift])throw new Error('Turno inválido.');return this.#mutate(ownerId,w=>{w.shift=shift;});}
  hire(ownerId,quantity=5){quantity=Math.max(1,Math.min(50,Math.floor(Number(quantity)||1)));const cost=quantity*HIRE_COST;industrialEconomyManager.debit(ownerId,cost,{type:'workforce_hire',description:`Contratação de ${quantity} trabalhadores`});return this.#mutate(ownerId,w=>{w.workers+=quantity;w.totalHired+=quantity;});}
  rest(ownerId){return this.#mutate(ownerId,w=>{w.morale=Math.min(100,w.morale+20);});}
  applyShiftWear(ownerId){return this.#mutate(ownerId,w=>{const s=SHIFTS[w.shift]??SHIFTS.normal;w.morale=Math.max(20,w.morale-s.moraleCost);});}
  capacity(ownerId){const w=this.get(ownerId);return Math.max(1,Math.floor(w.workers*(w.morale/100)*(SHIFTS[w.shift]?.factor??1)));}
  productivity(ownerId){const w=this.get(ownerId);return (ROLES[w.profession]?.productivity??1)*(SHIFTS[w.shift]?.factor??1);}
  addXp(ownerId,amount=1){return this.#mutate(ownerId,w=>{w.xp+=Math.max(0,Math.floor(Number(amount)||0));});}
  snapshot(ownerId){const w=this.get(ownerId);return structuredClone({...w,capacity:this.capacity(ownerId),productivity:this.productivity(ownerId),professionMeta:ROLES[w.profession]??null,shiftMeta:SHIFTS[w.shift]??SHIFTS.normal,hireCost:HIRE_COST});}
}
export const workforceManager=new WorkforceManager();
export { ROLES as INDUSTRIAL_PROFESSIONS, SHIFTS as INDUSTRIAL_SHIFTS };

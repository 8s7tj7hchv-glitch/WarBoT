import { loadIndustrialState, saveIndustrialState } from '../storage/IndustrialStore.js';
const DEFAULT_MAX=1000;
export class EnergyManager {
  get(ownerId){const s=loadIndustrialState();s.energy??={};s.energy[ownerId]??={current:DEFAULT_MAX,max:DEFAULT_MAX};saveIndustrialState(s);return s.energy[ownerId];}
  consume(ownerId,amount){amount=Math.max(0,Math.ceil(Number(amount)||0));const s=loadIndustrialState();s.energy??={};const e=s.energy[ownerId]??={current:DEFAULT_MAX,max:DEFAULT_MAX};if(e.current<amount)throw new Error(`Energia industrial insuficiente. Necessário: ${amount}. Disponível: ${e.current}.`);e.current-=amount;s.energy[ownerId]=e;saveIndustrialState(s);return e;}
  restore(ownerId,amount){amount=Math.max(0,Math.ceil(Number(amount)||0));const s=loadIndustrialState();s.energy??={};const e=s.energy[ownerId]??={current:DEFAULT_MAX,max:DEFAULT_MAX};e.current=Math.min(e.max,e.current+amount);s.energy[ownerId]=e;saveIndustrialState(s);return e;}
  upgrade(ownerId,amount=100){const s=loadIndustrialState();s.energy??={};const e=s.energy[ownerId]??={current:DEFAULT_MAX,max:DEFAULT_MAX};e.max+=Math.max(1,Math.ceil(Number(amount)||100));e.current=e.max;s.energy[ownerId]=e;saveIndustrialState(s);return e;}
}
export const energyManager=new EnergyManager();

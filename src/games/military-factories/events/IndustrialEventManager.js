const EVENTS = Object.freeze([
 {id:'efficiency_week',emoji:'⚡',name:'Semana da Eficiência',description:'Operações industriais recebem bônus abstrato de eficiência.',modifiers:{energyDiscount:0.10,qualityBonus:2,xpBonus:0}},
 {id:'quality_drive',emoji:'⭐',name:'Programa de Qualidade',description:'Controle de qualidade reforçado em todas as linhas.',modifiers:{energyDiscount:0,qualityBonus:5,xpBonus:0}},
 {id:'training_cycle',emoji:'👷',name:'Ciclo de Capacitação',description:'Equipes recebem experiência industrial adicional.',modifiers:{energyDiscount:0,qualityBonus:0,xpBonus:1}},
 {id:'logistics_focus',emoji:'🚚',name:'Operação Logística',description:'Período de foco em abastecimento e integração industrial.',modifiers:{energyDiscount:0.05,qualityBonus:1,xpBonus:0}}
]);
function weekIndex(date=new Date()){
 const epoch=Date.UTC(2026,0,5); const now=Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate());
 return Math.max(0,Math.floor((now-epoch)/(7*86400000)));
}
export class IndustrialEventManager {
 catalog(){return EVENTS;}
 active(date=new Date()){return EVENTS[weekIndex(date)%EVENTS.length];}
 modifiers(date=new Date()){return this.active(date).modifiers;}
 nextChange(date=new Date()){
  const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
  const day=(d.getUTCDay()+6)%7; d.setUTCDate(d.getUTCDate()+(7-day)); d.setUTCHours(0,0,0,0); return d;
 }
 applyEnergy(base,date=new Date()){const m=this.modifiers(date);return Math.max(1,Math.ceil(base*(1-m.energyDiscount)));}
 applyQuality(base,date=new Date()){return Math.max(0,Math.min(100,Math.round(base+this.modifiers(date).qualityBonus)));}
 xpMultiplier(date=new Date()){return 1+this.modifiers(date).xpBonus;}
}
export const industrialEventManager=new IndustrialEventManager();

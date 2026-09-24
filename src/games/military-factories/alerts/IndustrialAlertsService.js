import { factoryManager } from '../core/FactoryManager.js';
import { factoryMaintenanceManager } from '../maintenance/FactoryMaintenanceManager.js';
import { militaryContractManager } from '../contracts/MilitaryContractManager.js';

export class IndustrialAlertsService {
  list(userId) {
    const alerts=[];
    const factories=factoryManager.list(userId);
    for (const f of factories) {
      const condition=factoryMaintenanceManager.status(userId,f.factoryId).condition;
      if (condition <= 50) alerts.push({level:'critical',emoji:'🛠️',title:'Manutenção necessária',text:`${f.factoryId}: condição em ${condition}%`});
      else if (condition <= 75) alerts.push({level:'warning',emoji:'⚠️',title:'Desgaste industrial',text:`${f.factoryId}: condição em ${condition}%`});
      const running=f.queue.filter(x=>x.status==='running').length;
      const queued=f.queue.filter(x=>x.status==='queued').length;
      if (running) alerts.push({level:'info',emoji:'⚙️',title:'Produção em andamento',text:`${f.factoryId}: ${running} produção(ões) ativa(s)`});
      if (queued >= f.capacity) alerts.push({level:'warning',emoji:'📦',title:'Fila lotada',text:`${f.factoryId}: capacidade ${f.capacity}/${f.capacity}`});
    }
    const contracts=militaryContractManager.stats(userId);
    if (contracts.open) alerts.push({level:'info',emoji:'📑',title:'Pedidos aguardando',text:`${contracts.open} contrato(s) aberto(s)`});
    if (contracts.active) alerts.push({level:'info',emoji:'🚚',title:'Contratos ativos',text:`${contracts.active} contrato(s) em processamento`});
    return alerts;
  }
  summary(userId){
    const all=this.list(userId);
    return {total:all.length,critical:all.filter(x=>x.level==='critical').length,warning:all.filter(x=>x.level==='warning').length,info:all.filter(x=>x.level==='info').length,items:all};
  }
}
export const industrialAlertsService=new IndustrialAlertsService();

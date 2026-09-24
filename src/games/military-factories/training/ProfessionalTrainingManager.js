import { loadIndustrialState, saveIndustrialState } from '../storage/IndustrialStore.js';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';
import { workforceManager, INDUSTRIAL_PROFESSIONS } from '../workforce/WorkforceManager.js';

const MAX_LEVEL = 10;
const BASE_COST = 1200;
const SPECIALIZATIONS = Object.freeze({
  miner: { name: 'Extração Industrial', emoji: '⛏️' },
  blacksmith: { name: 'Metalurgia Industrial', emoji: '🔨' },
  builder: { name: 'Engenharia de Instalações', emoji: '🏗️' },
  trucker: { name: 'Logística Avançada', emoji: '🚚' },
  mechanic: { name: 'Manutenção Avançada', emoji: '🔧' },
  merchant: { name: 'Gestão de Contratos', emoji: '🏪' }
});

export class ProfessionalTrainingManager {
  get(ownerId) {
    const state = loadIndustrialState();
    state.training ??= {};
    const record = state.training[ownerId] ?? { levels: {}, totalTrainings: 0 };
    record.levels ??= {};
    record.totalTrainings ??= 0;
    state.training[ownerId] = record;
    saveIndustrialState(state);
    return structuredClone(record);
  }

  level(ownerId, professionId) {
    return Math.max(0, Number(this.get(ownerId).levels?.[professionId] ?? 0));
  }

  cost(ownerId, professionId) {
    const current = this.level(ownerId, professionId);
    return BASE_COST * (current + 1);
  }

  train(ownerId, professionId) {
    if (!INDUSTRIAL_PROFESSIONS[professionId]) throw new Error('Profissão industrial inválida.');
    const current = this.level(ownerId, professionId);
    if (current >= MAX_LEVEL) throw new Error('Treinamento já está no nível máximo.');
    const cost = this.cost(ownerId, professionId);
    industrialEconomyManager.debit(ownerId, cost, {
      type: 'professional_training',
      description: `Treinamento profissional: ${INDUSTRIAL_PROFESSIONS[professionId].name} nível ${current + 1}`
    });
    const state = loadIndustrialState();
    state.training ??= {};
    const record = state.training[ownerId] ?? { levels: {}, totalTrainings: 0 };
    record.levels ??= {};
    record.levels[professionId] = current + 1;
    record.totalTrainings = Number(record.totalTrainings ?? 0) + 1;
    state.training[ownerId] = record;
    saveIndustrialState(state);
    workforceManager.addXp(ownerId, 25 * (current + 1));
    return this.snapshot(ownerId, professionId);
  }

  bonus(ownerId, professionId) {
    const level = this.level(ownerId, professionId);
    return 1 + (level * 0.02);
  }

  snapshot(ownerId, professionId) {
    const meta = INDUSTRIAL_PROFESSIONS[professionId];
    if (!meta) throw new Error('Profissão industrial inválida.');
    const level = this.level(ownerId, professionId);
    return {
      professionId,
      profession: meta,
      specialization: SPECIALIZATIONS[professionId],
      level,
      maxLevel: MAX_LEVEL,
      bonusPercent: level * 2,
      nextCost: level < MAX_LEVEL ? this.cost(ownerId, professionId) : null
    };
  }

  list(ownerId) {
    return Object.keys(INDUSTRIAL_PROFESSIONS).map(id => this.snapshot(ownerId, id));
  }
}

export const professionalTrainingManager = new ProfessionalTrainingManager();
export { SPECIALIZATIONS as INDUSTRIAL_SPECIALIZATIONS };

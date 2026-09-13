import { EnergyManager } from '../players/EnergyManager.js';
import { ProfileManager } from '../players/ProfileManager.js';
import { StatisticsManager } from '../players/StatisticsManager.js';
import { ProfessionManager } from './ProfessionManager.js';
import { ProfessionProgression } from './ProfessionProgression.js';
import { ProfessionCooldownManager } from './ProfessionCooldownManager.js';
import { professionExists } from './registry.js';
export class ProfessionEngine {
  constructor() { this.profiles = new ProfileManager(); this.energy = new EnergyManager(this.profiles); this.manager = new ProfessionManager(); this.progression = new ProfessionProgression(this.manager); this.cooldowns = new ProfessionCooldownManager(); this.statistics = new StatisticsManager(); }
  canPerform(userId, professionId, action, energyCost, cooldownSeconds, requiredLevel = 1) {
    if (!professionExists(professionId)) return [false, 'Profissão inválida.']; const p = this.manager.get(userId, professionId); if (!p) return [false, 'Profissão não encontrada.']; if (p.unlocked === false) return [false, 'Profissão bloqueada.']; if ((p.level ?? 1) < requiredLevel) return [false, `Nível profissional ${requiredLevel} necessário.`]; if (!this.energy.has(userId, energyCost)) return [false, 'Energia insuficiente.']; const remaining = this.cooldowns.remaining(userId, professionId, action); if (remaining > 0) return [false, `Aguarde ${remaining}s.`]; return [true, 'Ação disponível.'];
  }
  completeAction(userId, professionId, action, energyCost, cooldownSeconds, xpReward) { if (energyCost > 0 && !this.energy.consume(userId, energyCost)) return null; if (cooldownSeconds > 0) this.cooldowns.set(userId, professionId, action, cooldownSeconds); const progress = this.progression.addXp(userId, professionId, xpReward); this.manager.incrementActions(userId, professionId, 1); this.statistics.increment(userId, 'profession_actions', 1); return progress; }
}

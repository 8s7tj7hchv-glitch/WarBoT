import { MAX_PROFESSION_LEVEL, PROFESSION_BASE_XP, PROFESSION_XP_EXPONENT } from '../config/settings.js';
import { ProfessionManager } from './ProfessionManager.js';
export class ProfessionProgression {
  constructor(manager = new ProfessionManager()) { this.manager = manager; }
  static xpRequired(level) { return Math.trunc(PROFESSION_BASE_XP * (Math.max(1, Number(level) || 1) ** PROFESSION_XP_EXPONENT)); }
  addXp(userId, professionId, amount) {
    const p = this.manager.get(userId, professionId); if (!p) return null; p.xp = Math.max(0, Math.trunc(Number(p.xp) || 0) + Math.max(0, Math.trunc(Number(amount) || 0)));
    let levelsGained = 0;
    while (p.level < MAX_PROFESSION_LEVEL) { const required = ProfessionProgression.xpRequired(p.level); if (p.xp < required) break; p.xp -= required; p.level += 1; levelsGained += 1; }
    p.level = Math.min(MAX_PROFESSION_LEVEL, p.level); this.manager.save(userId, professionId, p); return { ...p, levels_gained: levelsGained };
  }
  getProgress(userId, professionId) { const p = this.manager.get(userId, professionId); if (!p) return null; return { level: p.level, xp: p.xp, required: ProfessionProgression.xpRequired(p.level) }; }
}

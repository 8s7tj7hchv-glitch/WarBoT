import { factoryManager } from '../core/FactoryManager.js';
import { researchManager } from '../research/ResearchManager.js';
import { industrialAchievementManager } from '../achievements/IndustrialAchievementManager.js';

export const REPUTATION_TIERS = Object.freeze([
  { min: 0, name: 'Iniciante Industrial', emoji: '⚙️' },
  { min: 250, name: 'Operador Industrial', emoji: '🔧' },
  { min: 750, name: 'Fabricante Regional', emoji: '🏭' },
  { min: 1750, name: 'Fornecedor Nacional', emoji: '📦' },
  { min: 3500, name: 'Complexo Avançado', emoji: '🏗️' },
  { min: 6500, name: 'Potência Industrial', emoji: '⭐' },
  { min: 10000, name: 'Mestre Industrial', emoji: '🏆' }
]);

function researchLevels(userId) {
  const state = researchManager.get(userId);
  return Object.values(state.levels || {}).map(Number).filter(Number.isFinite);
}

export class IndustrialReputationManager {
  snapshot(userId) {
    const factories = factoryManager.list(userId);
    const achievements = industrialAchievementManager.profile(userId);
    const completed = factories.reduce((n, f) => n + Number(f.completed || 0), 0);
    const factoryLevels = factories.reduce((n, f) => n + Number(f.level || 0), 0);
    const research = researchLevels(userId).reduce((a, b) => a + b, 0);
    const unlocked = achievements.unlocked?.length || 0;

    // Pontuação exclusivamente de videogame: mede progresso industrial abstrato.
    const score = Math.floor(completed * 20 + factoryLevels * 15 + research * 40 + unlocked * 150);
    let tier = REPUTATION_TIERS[0];
    for (const candidate of REPUTATION_TIERS) if (score >= candidate.min) tier = candidate;
    const index = REPUTATION_TIERS.indexOf(tier);
    const next = REPUTATION_TIERS[index + 1] || null;
    return { score, tier, next, factories: factories.length, completed, factoryLevels, research, achievements: unlocked };
  }

  leaderboard(userIds = []) {
    return [...new Set(userIds)].map(userId => ({ userId, ...this.snapshot(userId) })).sort((a, b) => b.score - a.score);
  }
}
export const industrialReputationManager = new IndustrialReputationManager();

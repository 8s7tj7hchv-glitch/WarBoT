import { BonusManager } from './BonusManager.js';
const bonuses = new BonusManager();
const MAP = Object.freeze({
  easy: null, normal: 'miner_instinct', hard: 'logistics_ace', very_hard: 'industrial_master', extreme: 'global_strategist', legendary: 'world_champion'
});
export class MissionBonusService {
  rewardForDifficulty(difficulty) { return MAP[String(difficulty).toLowerCase()] ?? null; }
  grantForMission(userId, mission) {
    const bonusId = mission?.bonus_id ?? this.rewardForDifficulty(mission?.difficulty);
    if (!bonusId) return null;
    return bonuses.grant(userId, bonusId, { source:'mission', sourceId:mission?.id ?? null, durationDays:mission?.bonus_duration_days ?? null, metadata:{ difficulty:mission?.difficulty ?? null, mission_name:mission?.name ?? null } });
  }
}

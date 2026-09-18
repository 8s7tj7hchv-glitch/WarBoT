import { BonusManager } from './BonusManager.js';
const bonuses = new BonusManager();
export class BonusRewardService {
  grantFromGiveaway(userId, giveaway) { if (!giveaway?.bonus_id) return null; return bonuses.grant(userId, giveaway.bonus_id, { source:'giveaway', sourceId:giveaway.id ?? null }); }
  grantFromAchievement(userId, achievement) { if (!achievement?.bonus_id) return null; return bonuses.grant(userId, achievement.bonus_id, { source:'achievement', sourceId:achievement.id ?? null }); }
  grantFromWorldEvent(userId, event) { if (!event?.bonus_id) return null; return bonuses.grant(userId, event.bonus_id, { source:'world_event', sourceId:event.id ?? null }); }
  grantFromProMission(userId, mission) { if (!mission?.bonus_id) return null; return bonuses.grant(userId, mission.bonus_id, { source:'pro_mission', sourceId:mission.id ?? null }); }
}

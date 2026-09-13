import { ProfileManager } from './ProfileManager.js';

export class ProgressionManager {
  constructor(profileManager = new ProfileManager()) {
    this.profiles = profileManager;
  }

  static xpRequired(level) {
    const safeLevel = Math.max(1, Number(level) || 1);
    return Math.trunc(100 * (safeLevel ** 1.5));
  }

  addXp(userId, amount) {
    const numericAmount = Math.trunc(Number(amount) || 0);
    if (numericAmount <= 0) return this.profiles.get(userId);

    const profile = this.profiles.get(userId);
    if (!profile) return null;

    profile.xp = Number(profile.xp ?? 0) + numericAmount;
    profile.level = Math.max(1, Number(profile.level ?? 1));

    let levelsGained = 0;

    while (profile.xp >= ProgressionManager.xpRequired(profile.level)) {
      const needed = ProgressionManager.xpRequired(profile.level);
      profile.xp -= needed;
      profile.level += 1;
      levelsGained += 1;
    }

    this.profiles.saveProfile(userId, profile);

    return {
      ...profile,
      levels_gained: levelsGained
    };
  }

  getProgress(userId) {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    const level = Math.max(1, Number(profile.level ?? 1));
    const xp = Math.max(0, Number(profile.xp ?? 0));

    return {
      level,
      xp,
      required: ProgressionManager.xpRequired(level)
    };
  }
}

import { MAX_ENERGY } from '../config/settings.js';
import { ProfileManager } from './ProfileManager.js';

export class EnergyManager {
  constructor(profileManager = new ProfileManager()) {
    this.profiles = profileManager;
  }

  get(userId) {
    const profile = this.profiles.get(userId);
    return profile ? Math.trunc(Number(profile.energy ?? 0)) : 0;
  }

  has(userId, amount) {
    return this.get(userId) >= Math.max(0, Number(amount) || 0);
  }

  consume(userId, amount) {
    const value = Math.trunc(Number(amount) || 0);
    if (value <= 0) return false;

    const profile = this.profiles.get(userId);
    if (!profile) return false;

    const current = Math.trunc(Number(profile.energy ?? 0));
    if (current < value) return false;

    profile.energy = current - value;
    this.profiles.saveProfile(userId, profile);
    return true;
  }

  add(userId, amount) {
    const profile = this.profiles.get(userId);
    if (!profile) return 0;

    const current = Math.trunc(Number(profile.energy ?? 0));
    const increment = Math.max(0, Math.trunc(Number(amount) || 0));
    const newEnergy = Math.min(MAX_ENERGY, current + increment);

    profile.energy = newEnergy;
    this.profiles.saveProfile(userId, profile);
    return newEnergy;
  }

  set(userId, amount) {
    const profile = this.profiles.get(userId);
    if (!profile) return 0;

    const value = Math.max(0, Math.min(MAX_ENERGY, Math.trunc(Number(amount) || 0)));
    profile.energy = value;
    this.profiles.saveProfile(userId, profile);
    return value;
  }
}

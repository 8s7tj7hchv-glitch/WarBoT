import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { DATA_DIR } from '../config/settings.js';
import { isBotOwner } from './OwnerAccess.js';
import { VipManager } from './VipManager.js';

const CONFIG = path.join(DATA_DIR, 'owner', 'owner_config.json');
const DEFAULT_CONFIG = {
  ownerWarMultiplier: 100,
  proWarMultiplier: 1,
  exclusiveForcesEnabled: true,
  proPlayerEnabled: true
};

export class OwnerCombatManager {
  constructor({ vip = new VipManager() } = {}) {
    this.vip = vip;
    JsonManager.ensureFile(CONFIG, DEFAULT_CONFIG);
  }

  config() {
    const cfg = JsonManager.load(CONFIG, DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG, ...(cfg && typeof cfg === 'object' && !Array.isArray(cfg) ? cfg : {}) };
  }

  multiplierForUser(userId) {
    const cfg = this.config();
    if (isBotOwner(userId)) return Math.max(1, Number(cfg.ownerWarMultiplier) || 100);
    if (cfg.proPlayerEnabled && this.vip.isPro(userId)) return Math.max(1, Number(cfg.proWarMultiplier) || 1);
    return 1;
  }
}

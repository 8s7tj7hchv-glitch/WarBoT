import { industrialStatisticsManager } from '../statistics/IndustrialStatisticsManager.js';
import { industrialWarehouseManager } from '../warehouse/IndustrialWarehouseManager.js';
import { workforceManager } from '../workforce/WorkforceManager.js';
import { industrialAlertsService } from '../alerts/IndustrialAlertsService.js';
import { militaryContractManager } from '../contracts/MilitaryContractManager.js';
import { industrialReputationManager } from '../reputation/IndustrialReputationManager.js';
import { researchManager } from '../research/ResearchManager.js';

function safe(fn, fallback) { try { return fn(); } catch { return fallback; } }

export class IndustrialDashboardManager {
  snapshot(userId) {
    const statistics = safe(() => industrialStatisticsManager.snapshot(userId), {});
    const warehouse = safe(() => industrialWarehouseManager.status(userId), {});
    const workforce = safe(() => workforceManager.snapshot(userId), {});
    const alerts = safe(() => industrialAlertsService.summary(userId), { total: 0, critical: 0, warning: 0, info: 0 });
    const contracts = safe(() => militaryContractManager.stats(userId), { total: 0, open: 0, active: 0, completed: 0 });
    const reputation = safe(() => industrialReputationManager.snapshot(userId), null);
    const research = safe(() => researchManager.get(userId), { levels: {} });
    const researchLevels = Object.values(research?.levels || {}).map(Number).filter(Number.isFinite);
    return {
      statistics,
      warehouse,
      workforce,
      alerts,
      contracts,
      reputation,
      research: {
        totalLevels: researchLevels.reduce((a, b) => a + b, 0),
        areas: researchLevels.length,
        average: researchLevels.length ? researchLevels.reduce((a, b) => a + b, 0) / researchLevels.length : 0
      }
    };
  }
}
export const industrialDashboardManager = new IndustrialDashboardManager();

import { renderFactoriesPanel, renderFactoryDetail } from '../ui/FactoriesPanel.js';
import { renderProductionCatalog, renderProductConfirm, renderQueue } from '../ui/ProductionPanel.js';
import { factoryManager } from '../core/FactoryManager.js';
import { productionService } from '../production/ProductionService.js';
import { factoryMaintenanceManager } from '../maintenance/FactoryMaintenanceManager.js';
import { renderContractsPanel } from '../ui/ContractsPanel.js';
import { renderResearchPanel, renderTechnology } from '../ui/ResearchPanel.js';
import { researchManager } from '../research/ResearchManager.js';
import { renderUpgradesPanel } from '../ui/UpgradesPanel.js';
import { factoryUpgradeManager } from '../upgrades/FactoryUpgradeManager.js';
import { renderCertificationPanel } from '../ui/CertificationPanel.js';
import { renderMissionsPanel, claimMission } from '../ui/MissionsPanel.js';
import { renderAchievementsPanel } from '../ui/AchievementsPanel.js';
import { renderReputationPanel } from '../ui/ReputationPanel.js';
import { renderIndustrialEventsPanel } from '../ui/EventsPanel.js';
import { renderIndustrialEconomyPanel } from '../ui/EconomyPanel.js';
import { renderIndustrialStatisticsPanel } from '../ui/StatisticsPanel.js';
import { renderIndustrialAlertsPanel } from '../ui/AlertsPanel.js';
import { renderPlanningPanel, renderFactoryPlan } from '../ui/PlanningPanel.js';
import { industrialPlanningManager } from '../planning/IndustrialPlanningManager.js';
import { renderProcurementPanel } from '../ui/ProcurementPanel.js';
import { procurementManager } from '../procurement/ProcurementManager.js';
import { renderWarehousePanel } from '../ui/WarehousePanel.js';
import { industrialWarehouseManager } from '../warehouse/IndustrialWarehouseManager.js';
import { renderWorkforcePanel } from '../ui/WorkforcePanel.js';
import { workforceManager } from '../workforce/WorkforceManager.js';
import { renderTrainingPanel, renderTrainingDetail } from '../ui/TrainingPanel.js';
import { professionalTrainingManager } from '../training/ProfessionalTrainingManager.js';
import { renderDailyRewardsPanel } from '../ui/DailyRewardsPanel.js';
import { dailyIndustrialRewardManager } from '../rewards/DailyIndustrialRewardManager.js';
import { renderWeeklyRewardsPanel } from '../ui/WeeklyRewardsPanel.js';
import { weeklyIndustrialRewardManager } from '../rewards/WeeklyIndustrialRewardManager.js';
import { renderIndustrialRewardsPanel } from '../ui/RewardsPanel.js';
import { renderMonthlyRewardsPanel } from '../ui/MonthlyRewardsPanel.js';
import { renderIndustrialDashboardPanel } from '../ui/DashboardPanel.js';
import { monthlyIndustrialRewardManager } from '../rewards/MonthlyIndustrialRewardManager.js';
export async function handleMilitaryFactoriesInteraction(interaction){
 if(!(interaction.isButton?.()||interaction.isStringSelectMenu?.())) return false;
 const id=interaction.customId||''; if(!id.startsWith('mf:')) return false;
 const p=id.split(':');
 if(id==='mf:dashboard'||id==='mf:dashboard:refresh'||id==='mf:overview'){ await interaction.update(renderIndustrialDashboardPanel(interaction.user.id)); return true; }
 if(id==='mf:rewards'){ await interaction.update(renderIndustrialRewardsPanel(interaction.user.id)); return true; }
 if(id==='mf:monthly'||id==='mf:monthly:refresh'){ await interaction.update(renderMonthlyRewardsPanel(interaction.user.id)); return true; }
 if(id==='mf:monthly:claim'){ monthlyIndustrialRewardManager.claim(interaction.user.id); await interaction.update(renderMonthlyRewardsPanel(interaction.user.id)); return true; }
 if(id==='mf:weekly'||id==='mf:weekly:refresh'){ await interaction.update(renderWeeklyRewardsPanel(interaction.user.id)); return true; }
 if(id==='mf:weekly:claim'){ weeklyIndustrialRewardManager.claim(interaction.user.id); await interaction.update(renderWeeklyRewardsPanel(interaction.user.id)); return true; }
 if(id==='mf:daily'||id==='mf:daily:refresh'){ await interaction.update(renderDailyRewardsPanel(interaction.user.id)); return true; }
 if(id==='mf:daily:claim'){ dailyIndustrialRewardManager.claim(interaction.user.id); await interaction.update(renderDailyRewardsPanel(interaction.user.id)); return true; }
 if(id==='mf:training'||id==='mf:training:refresh'){ await interaction.update(renderTrainingPanel(interaction.user.id)); return true; }
 if(id==='mf:training:select'&&interaction.isStringSelectMenu?.()){ await interaction.update(renderTrainingDetail(interaction.user.id,interaction.values[0])); return true; }
 if(p[1]==='training'&&p[2]==='upgrade'&&p[3]){ professionalTrainingManager.train(interaction.user.id,p[3]); await interaction.update(renderTrainingDetail(interaction.user.id,p[3])); return true; }
 if(id==='mf:workforce'||id==='mf:workforce:refresh'){ await interaction.update(renderWorkforcePanel(interaction.user.id)); return true; }
 if(id==='mf:workforce:hire'){ workforceManager.hire(interaction.user.id,5); await interaction.update(renderWorkforcePanel(interaction.user.id)); return true; }
 if(id==='mf:workforce:rest'){ workforceManager.rest(interaction.user.id); await interaction.update(renderWorkforcePanel(interaction.user.id)); return true; }
 if(id==='mf:workforce:profession'&&interaction.isStringSelectMenu?.()){ workforceManager.setProfession(interaction.user.id,interaction.values[0]); await interaction.update(renderWorkforcePanel(interaction.user.id)); return true; }
 if(id==='mf:workforce:shift'&&interaction.isStringSelectMenu?.()){ workforceManager.setShift(interaction.user.id,interaction.values[0]); await interaction.update(renderWorkforcePanel(interaction.user.id)); return true; }
 if(id==='mf:warehouse'||id==='mf:warehouse:refresh'){ await interaction.update(renderWarehousePanel(interaction.user.id)); return true; }
 if(id==='mf:warehouse:upgrade'){ industrialWarehouseManager.upgrade(interaction.user.id); await interaction.update(renderWarehousePanel(interaction.user.id)); return true; }
 if(id==='mf:procurement'||id==='mf:procurement:refresh'){ await interaction.update(renderProcurementPanel(interaction.user.id)); return true; }
 if(id==='mf:procurement:buy'&&interaction.isStringSelectMenu?.()){ procurementManager.buy(interaction.user.id,interaction.values[0]); await interaction.update(renderProcurementPanel(interaction.user.id)); return true; }
 if(id==='mf:planning'||id==='mf:planning:refresh'){ await interaction.update(renderPlanningPanel(interaction.user.id)); return true; }
 if(id==='mf:planning:select'&&interaction.isStringSelectMenu?.()){ await interaction.update(renderFactoryPlan(interaction.user.id,interaction.values[0])); return true; }
 if(p[1]==='planning'&&p[2]==='create'){ industrialPlanningManager.create(interaction.user.id,p[3]); await interaction.update(renderFactoryPlan(interaction.user.id,p[3])); return true; }
 if(p[1]==='planning'&&p[2]==='claim'){ industrialPlanningManager.claim(interaction.user.id,p[3]); await interaction.update(renderFactoryPlan(interaction.user.id,p[3])); return true; }
 if(p[1]==='planning'&&p[2]==='cancel'){ industrialPlanningManager.cancel(interaction.user.id,p[3]); await interaction.update(renderFactoryPlan(interaction.user.id,p[3])); return true; }
 if(id==='mf:alerts'||id==='mf:alerts:refresh'){ await interaction.update(renderIndustrialAlertsPanel(interaction.user.id)); return true; }
 if(id==='mf:statistics'||id==='mf:statistics:refresh'){ await interaction.update(renderIndustrialStatisticsPanel(interaction.user.id)); return true; }
 if(id==='mf:economy'||id==='mf:economy:refresh'){ await interaction.update(renderIndustrialEconomyPanel(interaction.user.id)); return true; }
 if(id==='mf:events'||id==='mf:events:refresh'){ await interaction.update(renderIndustrialEventsPanel()); return true; }
 if(id==='mf:reputation'||id==='mf:reputation:refresh'){ await interaction.update(renderReputationPanel(interaction.user.id)); return true; }
 if(id==='mf:achievements'||id==='mf:achievements:refresh'){ await interaction.update(renderAchievementsPanel(interaction.user.id)); return true; }
 if(id==='mf:missions'){ await interaction.update(renderMissionsPanel(interaction.user.id)); return true; }
 if(id==='mf:missions:claim'&&interaction.isStringSelectMenu?.()){ claimMission(interaction.user.id,interaction.values[0]); await interaction.update(renderMissionsPanel(interaction.user.id)); return true; }
 if(id==='mf:factory:select'){ await interaction.update(renderFactoryDetail(interaction.user.id,interaction.values[0])); return true; }
 if(id==='mf:research'){ await interaction.update(renderResearchPanel(interaction.user.id)); return true; }
 if(id==='mf:research:select'){ await interaction.update(renderTechnology(interaction.user.id,interaction.values[0])); return true; }
 if(p[1]==='research'&&p[2]==='upgrade'){ researchManager.upgrade(interaction.user.id,p[3]); await interaction.update(renderTechnology(interaction.user.id,p[3])); return true; }
 if(p[1]==='upgrades'&&p[2]){ await interaction.update(renderUpgradesPanel(interaction.user.id,p[2])); return true; }
 if(p[1]==='certification'&&p[2]){ await interaction.update(renderCertificationPanel(interaction.user.id,p[2])); return true; }
 if(p[1]==='upgrade'&&p[2]&&p[3]){ factoryUpgradeManager.upgrade(interaction.user.id,p[2],p[3]); await interaction.update(renderUpgradesPanel(interaction.user.id,p[2])); return true; }
 if(id==='mf:contracts'||id==='mf:contracts:refresh'){ await interaction.update(renderContractsPanel(interaction.user.id)); return true; }
 if(id==='mf:home'||id==='mf:refresh'||id==='mf:queues'){ await interaction.update(renderFactoriesPanel(interaction.user.id)); return true; }
 if(p[1]==='refresh'&&p[2]){ await interaction.update(renderFactoryDetail(interaction.user.id,p[2])); return true; }
 if(p[1]==='level'){ factoryManager.levelUp(interaction.user.id,p[2]); await interaction.update(renderFactoryDetail(interaction.user.id,p[2])); return true; }
 if(p[1]==='maintain'){ factoryMaintenanceManager.maintain(interaction.user.id,p[2]); await interaction.update(renderFactoryDetail(interaction.user.id,p[2])); return true; }
 if(p[1]==='production'){ await interaction.update(renderProductionCatalog(interaction.user.id,p[2])); return true; }
 if(p[1]==='product'&&interaction.isStringSelectMenu?.()){ await interaction.update(renderProductConfirm(interaction.user.id,p[2],interaction.values[0])); return true; }
 if(p[1]==='add'){ productionService.create(interaction.user.id,p[2],p[3],1); await interaction.update(renderQueue(interaction.user.id,p[2])); return true; }
 if(p[1]==='queue'){ await interaction.update(renderQueue(interaction.user.id,p[2])); return true; }
 if(p[1]==='start'){ productionService.start(interaction.user.id,p[2]); await interaction.update(renderQueue(interaction.user.id,p[2])); return true; }
 if(p[1]==='complete'){ productionService.complete(interaction.user.id,p[2],p.slice(3).join(':')); await interaction.update(renderQueue(interaction.user.id,p[2])); return true; }
 return false;
}

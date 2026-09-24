export { FACTORIES, getFactory } from './core/FactoryRegistry.js';
export { FactoryManager, factoryManager } from './core/FactoryManager.js';
export { handleMilitaryFactoriesInteraction } from './interactions/FactoriesRouter.js';
export { renderFactoriesPanel, renderFactoryDetail } from './ui/FactoriesPanel.js';

export { industrialInventory } from './inventory/IndustrialInventory.js';
export { productionCost } from './production/ProductionEconomy.js';
export { DeliveryService } from './delivery/DeliveryService.js';
export { INDUSTRIAL_RESOURCES } from './resources/ResourceCatalog.js';
export { energyManager, EnergyManager } from './energy/EnergyManager.js';
export { workforceManager, WorkforceManager, INDUSTRIAL_PROFESSIONS } from './workforce/WorkforceManager.js';
export { factoryMaintenanceManager, FactoryMaintenanceManager } from './maintenance/FactoryMaintenanceManager.js';

export { militaryContractManager, MilitaryContractManager } from './contracts/MilitaryContractManager.js';
export { contractProductionService, ContractProductionService } from './contracts/ContractProductionService.js';
export { renderContractsPanel } from './ui/ContractsPanel.js';

// Fase 8 — Logística Industrial
export { IndustrialLogisticsManager } from './logistics/IndustrialLogisticsManager.js';
export { LogisticsService } from './logistics/LogisticsService.js';
export { renderLogisticsPanel } from './ui/LogisticsPanel.js';

// Fase 9 — Pesquisa e Tecnologias
export { TECHNOLOGIES, getTechnology, technologyCost } from './research/TechnologyCatalog.js';
export { ResearchManager, researchManager } from './research/ResearchManager.js';
export { renderResearchPanel, renderTechnology } from './ui/ResearchPanel.js';

// Fase 14 — Missões e Progressão Industrial
export { IndustrialMissionManager, industrialMissionManager, MISSION_CATALOG } from './missions/IndustrialMissionManager.js';
export { renderMissionsPanel } from './ui/MissionsPanel.js';

// Fase 15 — Conquistas Industriais
export { IndustrialAchievementManager, industrialAchievementManager, ACHIEVEMENTS } from './achievements/IndustrialAchievementManager.js';
export { renderAchievementsPanel } from './ui/AchievementsPanel.js';

// Fase 17 — Ranking Industrial
export { IndustrialRankingManager, industrialRankingManager } from './ranking/IndustrialRankingManager.js';
export { renderIndustrialRankingPanel } from './ui/RankingPanel.js';

// Fase 18 — Eventos Industriais
export { IndustrialEventManager, industrialEventManager } from './events/IndustrialEventManager.js';
export { renderIndustrialEventsPanel } from './ui/EventsPanel.js';

// Fase 19 — Economia Industrial
export { IndustrialEconomyManager, industrialEconomyManager } from './economy/IndustrialEconomyManager.js';
export { renderIndustrialEconomyPanel } from './ui/EconomyPanel.js';

// Fase 26 — Treinamento e Especialização Profissional
export { ProfessionalTrainingManager, professionalTrainingManager, INDUSTRIAL_SPECIALIZATIONS } from './training/ProfessionalTrainingManager.js';
export { renderTrainingPanel, renderTrainingDetail } from './ui/TrainingPanel.js';

// Fase 27 — Recompensa Industrial Diária
export { DailyIndustrialRewardManager, dailyIndustrialRewardManager, DAILY_INDUSTRIAL_REWARDS } from './rewards/DailyIndustrialRewardManager.js';
export { renderDailyRewardsPanel } from './ui/DailyRewardsPanel.js';

// Fase 30 — Painel Geral de Gestão Industrial
export { industrialDashboardManager, IndustrialDashboardManager } from './dashboard/IndustrialDashboardManager.js';
export { renderIndustrialDashboardPanel } from './ui/DashboardPanel.js';

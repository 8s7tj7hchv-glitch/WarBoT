import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'botnt-integration-'));
const tempData = path.join(tempRoot, 'data');
fs.cpSync(path.join(root, 'data'), tempData, { recursive: true });
process.env.TNT_DATA_DIR = tempData;

try {
  const { ProfileManager } = await import('../src/players/ProfileManager.js');
  const { ProgressionManager } = await import('../src/players/ProgressionManager.js');
  const { EnergyManager } = await import('../src/players/EnergyManager.js');
  const { InventoryManager } = await import('../src/inventory/InventoryManager.js');
  const { StorageTransferManager } = await import('../src/storage/StorageTransferManager.js');
  const { EconomyService } = await import('../src/economy/EconomyService.js');
  const { ProductionManager } = await import('../src/production/ProductionManager.js');
  const { MarketManager } = await import('../src/market/MarketManager.js');
  const { MarketOrderManager } = await import('../src/market/MarketOrderManager.js');
  const { LogisticsManager } = await import('../src/market/LogisticsManager.js');
  const { InternationalMarketManager } = await import('../src/market/InternationalMarketManager.js');
  const { InternationalOrderManager } = await import('../src/market/InternationalOrderManager.js');
  const { MarketHubService } = await import('../src/market/MarketHubService.js');
  const { MarketIntegrityManager } = await import('../src/market/MarketIntegrityManager.js');
  const { CountryManager } = await import('../src/world/CountryManager.js');
  const { TerritoryManager } = await import('../src/world/TerritoryManager.js');
  const { TerritorialControlManager } = await import('../src/world/TerritorialControlManager.js');
  const { TechnologyManager } = await import('../src/military_industry/TechnologyManager.js');
  const { MilitaryComplexManager } = await import('../src/military_industry/MilitaryComplexManager.js');
  const { ResearchManager } = await import('../src/military_industry/ResearchManager.js');
  const { NationalStockpileManager } = await import('../src/military_industry/NationalStockpileManager.js');
  const { NationalMilitaryProductionManager } = await import('../src/military_industry/NationalMilitaryProductionManager.js');
  const { MilitaryMaintenanceManager } = await import('../src/military_industry/MilitaryMaintenanceManager.js');
  const { UnitManager } = await import('../src/military/UnitManager.js');
  const { MilitaryIndustryHubService } = await import('../src/military_industry/MilitaryIndustryHubService.js');

  const A = '900000000000000001';
  const B = '900000000000000002';
  const C = '900000000000000003';

  const profiles = new ProfileManager();
  const created = profiles.getOrCreate(A, 'TesterA');
  assert.equal(created.user_id, A);
  assert.equal(created.level, 1);

  const progression = new ProgressionManager(profiles);
  assert.ok(progression.addXp(A, 250).level >= 2);

  const energy = new EnergyManager(profiles);
  energy.set(A, 100);
  assert.equal(energy.consume(A, 10), true);
  assert.equal(energy.get(A), 90);

  const inventory = new InventoryManager();
  let [ok] = inventory.addItem(A, 'wood', 10, 70);
  assert.equal(ok, true);
  assert.equal(inventory.getQuantity(A, 'wood'), 10);

  const transfer = new StorageTransferManager();
  [ok] = transfer.inventoryToStorage(A, 'warehouse', 'wood', 4);
  assert.equal(ok, true);
  [ok] = transfer.storageToInventory(A, 'warehouse', 'wood', 2);
  assert.equal(ok, true);
  assert.equal(inventory.getQuantity(A, 'wood'), 8);

  const economy = new EconomyService();
  economy.wallet.setBalance(A, 1000);
  economy.wallet.setBalance(B, 1000);
  assert.equal(economy.deposit(A, 100)[0], true);
  assert.equal(economy.withdraw(A, 50)[0], true);
  assert.equal(economy.transfer(A, B, 25)[0], true);

  profiles.getOrCreate(B, 'TesterB');
  energy.set(A, 100);
  inventory.addItem(A, 'iron_ore', 3, 60);
  inventory.addItem(A, 'coal', 1, 60);
  const production = new ProductionManager();
  const craft = production.craft(A, 'refine_iron', 1);
  assert.equal(craft[0], true, craft[1]);
  assert.ok(inventory.getQuantity(A, 'iron') >= 2);

  inventory.addItem(A, 'wood', 5, 75);
  const market = new MarketManager();
  const orders = new MarketOrderManager();
  const sellerBefore = economy.getBalance(A);
  const buyerBefore = economy.getBalance(B);
  const sell = market.createSellOrder(A, 'wood', 3, 10);
  assert.equal(sell[0], true, sell[1]);
  const buy = market.createBuyOrder(B, 'wood', 3, 12);
  assert.equal(buy[0], true, buy[1]);
  assert.equal(orders.listSell('wood').filter((o) => o.seller_id === A).length, 0);
  assert.equal(orders.listBuy('wood').filter((o) => o.buyer_id === B).length, 0);
  const logistics = new LogisticsManager();
  const shipment = logistics.listOpen().find((x) => x.buyer_id === B && x.item_id === 'wood');
  assert.ok(shipment, 'O trade deve criar um frete P2P.');
  assert.equal(new InventoryManager().getQuantity(B, 'wood'), 0);
  assert.equal(logistics.accept(C, shipment.id)[0], true);
  assert.equal(logistics.deliver(C, shipment.id)[0], true);
  assert.ok(new InventoryManager().getQuantity(B, 'wood') >= 3);
  assert.equal(economy.getBalance(B), buyerBefore - 30);
  assert.ok(economy.getBalance(A) > sellerBefore);

  // Cancelamento devolve integralmente o escrow da compra ainda aberta.
  const openBuy = market.createBuyOrder(B, 'iron_ore', 2, 20);
  assert.equal(openBuy[0], true);
  const reservedBalance = economy.getBalance(B);
  assert.equal(market.cancelBuyOrder(B, openBuy[2].id)[0], true);
  assert.equal(economy.getBalance(B), reservedBalance + 40);

  // Mercado internacional: só faz matching entre servidores diferentes e cria frete internacional.
  const international = new InternationalMarketManager();
  const internationalOrders = new InternationalOrderManager();
  const G1 = '800000000000000001';
  const G2 = '800000000000000002';
  inventory.addItem(A, 'iron_ore', 4, 65);
  const intlSell = international.createSellOrder(A, G1, 'Servidor Alfa', 'iron_ore', 2, 15);
  assert.equal(intlSell[0], true, intlSell[1]);
  const intlBuy = international.createBuyOrder(B, G2, 'Servidor Beta', 'iron_ore', 2, 16);
  assert.equal(intlBuy[0], true, intlBuy[1]);
  assert.equal(internationalOrders.listSell('iron_ore').filter((o) => o.seller_id === A).length, 0);
  assert.equal(internationalOrders.listBuy('iron_ore').filter((o) => o.buyer_id === B).length, 0);
  const intlShipment = logistics.listOpen().find((x) => x.market_scope === 'international' && x.buyer_id === B && x.item_id === 'iron_ore');
  assert.ok(intlShipment, 'O trade internacional deve criar frete entre servidores.');
  assert.equal(intlShipment.origin_guild_id, G1);
  assert.equal(intlShipment.destination_guild_id, G2);
  assert.equal(logistics.accept(C, intlShipment.id)[0], true);
  assert.equal(logistics.deliver(C, intlShipment.id)[0], true);
  assert.ok(new InventoryManager().getQuantity(B, 'iron_ore') >= 2);

  // Passo 8: central integrada e auditoria de consistência.
  const hub = new MarketHubService();
  const dashboard = hub.dashboard(B, G2);
  assert.ok(dashboard.trades.total >= 2);
  assert.ok(dashboard.logistics.delivered >= 2);
  assert.ok(dashboard.user.trades >= 2);
  const itemSummary = hub.itemSummary('wood');
  assert.equal(itemSummary.item_id, 'wood');
  const audit = new MarketIntegrityManager().audit();
  assert.equal(audit.ok, true, JSON.stringify(audit.issues));

  // Fase 6: país, tecnologia, complexo, estoque nacional, produção e manutenção.
  economy.wallet.setBalance(A, 1000000);
  const countries = new CountryManager();
  const country = countries.create({ guildId: G1, guildName: 'Servidor Alfa', leaderId: A, name: 'República Teste', code: 'TST', emoji: '🧪' });
  const territories = new TerritoryManager();
  const territory = territories.neutral()[0];
  assert.ok(territory, 'É necessário um território neutro para o teste.');
  new TerritorialControlManager({ countries, territories }).claimNeutral(country.id, territory.id, { actorId: A });

  const technologies = new TechnologyManager();
  const complexes = new MilitaryComplexManager({ countries, territories, economy, technologies });
  const research = new ResearchManager({ countries, economy, technologies, complexes });
  assert.equal(research.fund(A, 2000)[0], true);
  assert.equal(research.unlock(A, 'industrial_foundations')[0], true);
  assert.equal(complexes.build(A, territory.id, 'component_complex')[0], true);

  const stockpile = new NationalStockpileManager({ countries, complexes });
  stockpile.add(country.id, 'aegis_alloy', 3, 60);
  stockpile.add(country.id, 'quantum_fiber', 2, 60);
  stockpile.add(country.id, 'control_unit', 1, 60);
  const nationalProduction = new NationalMilitaryProductionManager({ countries, territories, technologies, complexes, stockpile });
  const nationalCraft = nationalProduction.produce(A, territory.id, 'craft_vector_core', 1);
  assert.equal(nationalCraft[0], true, nationalCraft[1]);
  assert.ok(stockpile.getQuantity(country.id, 'vector_core') >= 1);

  const units = new UnitManager({ countries, territories });
  const unit = units.create({ countryId: country.id, templateId: 'frontier_cohort', territoryId: territory.id, actorId: A });
  units.update(unit.id, { readiness: 40, morale: 40 });
  stockpile.add(country.id, 'steel_bolt', 2, 50);
  stockpile.add(country.id, 'industrial_filter', 1, 50);
  const maintenance = new MilitaryMaintenanceManager({ countries, units, stockpile, technologies });
  const maintained = maintenance.maintainUnit(A, unit.id);
  assert.equal(maintained[0], true, maintained[1]);
  assert.ok(maintained[2].readiness > 40);

  const industryHub = new MilitaryIndustryHubService();
  const industryDashboard = industryHub.dashboard(A);
  assert.equal(industryDashboard.country.id, country.id);
  assert.ok(industryDashboard.complexes.length >= 1);
  assert.equal(industryHub.audit().ok, true, JSON.stringify(industryHub.audit().issues));

  console.log('✅ Integração principal OK: Fases 1–6, incluindo mercado, mundo, forças armadas e indústria militar nacional fictícia.');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BASE_DIR = path.resolve(__dirname, '../..');

export const BOT_TOKEN = String(process.env.BOT_TOKEN ?? '').trim();
export const BOT_PREFIX = '!';
export const BOT_NAME = 'TNT';
export const OWNER_ID = '0';

export const DATA_DIR = process.env.TNT_DATA_DIR
  ? path.resolve(process.env.TNT_DATA_DIR)
  : path.join(BASE_DIR, 'data');
export const PLAYERS_DATA_DIR = path.join(DATA_DIR, 'players');
export const ECONOMY_DATA_DIR = path.join(DATA_DIR, 'economy');
export const INVENTORY_DATA_DIR = path.join(DATA_DIR, 'inventory');
export const RESOURCES_DATA_DIR = path.join(DATA_DIR, 'resources');
export const PRODUCTS_DATA_DIR = path.join(DATA_DIR, 'products');
export const CONFIG_DATA_DIR = path.join(DATA_DIR, 'config');
export const STORAGE_DATA_DIR = path.join(DATA_DIR, 'storage');
export const PRODUCTION_DATA_DIR = path.join(DATA_DIR, 'production');

export const PROFESSIONS_DATA_DIR = path.join(DATA_DIR, 'professions');
export const MINING_DATA_DIR = path.join(PROFESSIONS_DATA_DIR, 'mining');
export const BLACKSMITH_DATA_DIR = path.join(PROFESSIONS_DATA_DIR, 'blacksmith');
export const CONSTRUCTION_DATA_DIR = path.join(PROFESSIONS_DATA_DIR, 'construction');
export const TRUCKING_DATA_DIR = path.join(PROFESSIONS_DATA_DIR, 'trucking');
export const MECHANIC_DATA_DIR = path.join(PROFESSIONS_DATA_DIR, 'mechanic');
export const MERCHANT_DATA_DIR = path.join(PROFESSIONS_DATA_DIR, 'merchant');

export const BUILDINGS_DATA_DIR = path.join(DATA_DIR, 'buildings');
export const EQUIPMENT_DATA_DIR = path.join(DATA_DIR, 'equipment');
export const MARKET_DATA_DIR = path.join(DATA_DIR, 'market');
export const INDUSTRIAL_DATA_DIR = path.join(DATA_DIR, 'industrial');
export const WORLD_DATA_DIR = path.join(DATA_DIR, 'world');
export const MILITARY_DATA_DIR = path.join(DATA_DIR, 'military');
export const MILITARY_INDUSTRY_DATA_DIR = path.join(DATA_DIR, 'military_industry');
export const WARFARE_DATA_DIR = path.join(DATA_DIR, 'warfare');
export const DIPLOMACY_DATA_DIR = path.join(DATA_DIR, 'diplomacy');
export const GLOBAL_WAR_DATA_DIR = path.join(DATA_DIR, 'global_war');
export const NOTIFICATIONS_DATA_DIR = path.join(DATA_DIR, 'notifications');
export const TRADES_DATA_DIR = path.join(DATA_DIR, 'trades');

export const EMBED_COLOR = 0xF5A623;
export const SUCCESS_COLOR = 0x57F287;
export const ERROR_COLOR = 0xED4245;
export const WARNING_COLOR = 0xFEE75C;

export const START_LEVEL = 1;
export const START_XP = 0;
export const START_ENERGY = 100;
export const MAX_ENERGY = 100;

export const START_WALLET = 1000;
export const START_BANK = 0;
export const DEFAULT_INVENTORY_CAPACITY = 100;

export const DEFAULT_WAREHOUSE_CAPACITY = 5000;
export const DEFAULT_INDUSTRIAL_STORAGE_CAPACITY = 25000;
export const DEFAULT_GARAGE_CAPACITY = 10;

export const MAX_PROFESSION_LEVEL = 1000;
export const PROFESSION_BASE_XP = 100;
export const PROFESSION_XP_EXPONENT = 1.45;

export const MARKET_SELL_FEE = 0.03;
export const MARKET_BUY_FEE = 0.02;
export const MARKET_MAX_ACTIVE_ORDERS = 25;
export const MARKET_INTERNATIONAL_SELL_FEE = 0.05;
export const MARKET_INTERNATIONAL_LOGISTICS_SHARE = 0.40;

export const MARKET_DYNAMIC_MIN_MULTIPLIER = 0.35;
export const MARKET_DYNAMIC_MAX_MULTIPLIER = 4.0;
export const MARKET_DEMAND_WEIGHT = 0.30;
export const MARKET_SUPPLY_WEIGHT = 0.25;
export const MARKET_SCARCITY_WEIGHT = 0.25;
export const MARKET_MOMENTUM_WEIGHT = 0.20;

export const DIRECTORIES = [
  DATA_DIR,
  PLAYERS_DATA_DIR,
  ECONOMY_DATA_DIR,
  INVENTORY_DATA_DIR,
  RESOURCES_DATA_DIR,
  PRODUCTS_DATA_DIR,
  CONFIG_DATA_DIR,
  STORAGE_DATA_DIR,
  PRODUCTION_DATA_DIR,
  PROFESSIONS_DATA_DIR,
  MINING_DATA_DIR,
  BLACKSMITH_DATA_DIR,
  CONSTRUCTION_DATA_DIR,
  TRUCKING_DATA_DIR,
  MECHANIC_DATA_DIR,
  MERCHANT_DATA_DIR,
  BUILDINGS_DATA_DIR,
  EQUIPMENT_DATA_DIR,
  MARKET_DATA_DIR,
  INDUSTRIAL_DATA_DIR,
  WORLD_DATA_DIR,
  MILITARY_DATA_DIR,
  MILITARY_INDUSTRY_DATA_DIR,
  WARFARE_DATA_DIR,
  DIPLOMACY_DATA_DIR,
  GLOBAL_WAR_DATA_DIR,
  NOTIFICATIONS_DATA_DIR,
  TRADES_DATA_DIR
];

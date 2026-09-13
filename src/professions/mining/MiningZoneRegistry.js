import path from 'node:path'; import { MINING_DATA_DIR } from '../../config/settings.js'; import { JsonRegistry } from '../JsonRegistry.js';
export class MiningZoneRegistry extends JsonRegistry { constructor(){super(path.join(MINING_DATA_DIR,'zones.json'));} }

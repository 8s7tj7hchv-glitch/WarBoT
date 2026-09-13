import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MARKET_DATA_DIR } from '../config/settings.js';
const FILE=path.join(MARKET_DATA_DIR,'indexes.json');
export class MarketIndexManager { constructor(){JsonManager.ensureFile(FILE,{});} get(itemId){return JsonManager.load(FILE,{})[itemId]??null;} saveIndex(itemId,index){const d=JsonManager.load(FILE,{}); d[itemId]={item_id:itemId,updated_at:new Date().toISOString(),...structuredClone(index)}; JsonManager.save(FILE,d); return d[itemId];} listAll(){return JsonManager.load(FILE,{});} }

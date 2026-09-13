import path from 'node:path';
import crypto from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_DATA_DIR } from '../config/settings.js';
import { UnitManager } from './UnitManager.js';
import { MilitaryAssetManager } from './MilitaryAssetManager.js';
const FILE=path.join(MILITARY_DATA_DIR,'deployment_history.json');
export class DeploymentManager{
 constructor({units=new UnitManager(),assets=new MilitaryAssetManager()}={}){this.units=units;this.assets=assets;JsonManager.ensureFile(FILE,[])}
 history(){const d=JsonManager.load(FILE,[]);return Array.isArray(d)?d:[]}
 record(entry){const d=this.history();d.push({id:`deployment_${crypto.randomUUID()}`,...entry,created_at:new Date().toISOString()});JsonManager.save(FILE,d);return d.at(-1)}
 stationUnit(unitId,territoryId,actorId=null){const r=this.units.station(unitId,territoryId,{actorId});this.record({type:'unit_station',country_id:r.unit.country_id,unit_id:r.unit.id,from_territory_id:r.from,to_territory_id:r.to,actor_id:actorId?String(actorId):null});return r.unit}
 stationAsset(assetId,territoryId,actorId=null){const before=this.assets.get(assetId);const a=this.assets.station(assetId,territoryId);this.record({type:'asset_station',country_id:a.country_id,asset_id:a.id,from_territory_id:before?.territory_id??null,to_territory_id:a.territory_id,actor_id:actorId?String(actorId):null});return a}
}

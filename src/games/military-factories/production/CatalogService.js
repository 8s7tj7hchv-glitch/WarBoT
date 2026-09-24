import vehicles from '../factories/vehicles/catalog.js';
import armored from '../factories/armored/catalog.js';
import aviation from '../factories/aviation/catalog.js';
import shipyard from '../factories/shipyard/catalog.js';
import missileSystems from '../factories/missile-systems/catalog.js';
import strategic from '../factories/strategic/catalog.js';
import electronics from '../factories/electronics/catalog.js';
import components from '../factories/components/catalog.js';
import heavyEquipment from '../factories/heavy-equipment/catalog.js';
import logistics from '../factories/logistics/catalog.js';
import maintenance from '../factories/maintenance/catalog.js';
import research from '../factories/research/catalog.js';

const catalogs={vehicles,armored,aviation,shipyard,'missile-systems':missileSystems,strategic,electronics,components,'heavy-equipment':heavyEquipment,logistics,maintenance,research};
export function getCatalog(factoryId){ return catalogs[factoryId] ?? []; }
export function getCatalogItem(factoryId,itemId){ return getCatalog(factoryId).find(x=>x.id===itemId) ?? null; }

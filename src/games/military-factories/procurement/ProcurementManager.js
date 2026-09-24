import { industrialInventory } from '../inventory/IndustrialInventory.js';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';
import { INDUSTRIAL_RESOURCES } from '../resources/ResourceCatalog.js';
import { industrialWarehouseManager } from '../warehouse/IndustrialWarehouseManager.js';

export const SUPPLY_CATALOG = Object.freeze({
 alloy_fictional:{price:180,pack:10}, composite_fictional:{price:220,pack:10}, electronics_fictional:{price:260,pack:10},
 energy_cell:{price:120,pack:10}, industrial_parts:{price:150,pack:10}, logistics_kit:{price:140,pack:10},
 research_data:{price:300,pack:10}, strategic_token:{price:500,pack:5}
});

export class ProcurementManager {
 list(ownerId){const inv=industrialInventory.snapshot(ownerId);return Object.entries(SUPPLY_CATALOG).map(([id,o])=>({id,name:INDUSTRIAL_RESOURCES[id]?.name??id,emoji:INDUSTRIAL_RESOURCES[id]?.emoji??'📦',stock:inv.resources[id]||0,...o}));}
 buy(ownerId,id){const offer=SUPPLY_CATALOG[id];if(!offer)throw new Error('Suprimento inválido.');if(!industrialWarehouseManager.canStore(ownerId,offer.pack))throw new Error('Armazém industrial sem espaço. Expanda a capacidade antes de comprar mais suprimentos.');industrialEconomyManager.debit(ownerId,offer.price,{type:'industrial_supply',description:`Compra de ${offer.pack}x ${INDUSTRIAL_RESOURCES[id]?.name??id}`,reference:id});industrialInventory.addResource(ownerId,id,offer.pack);return industrialInventory.snapshot(ownerId).resources[id]||0;}
}
export const procurementManager=new ProcurementManager();

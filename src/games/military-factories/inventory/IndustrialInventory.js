import { loadIndustrialState,saveIndustrialState } from '../storage/IndustrialStore.js';
class IndustrialInventory {
 constructor(){this.state=loadIndustrialState();}
 ensure(ownerId){if(!this.state[ownerId])this.state[ownerId]={resources:{},stock:{},deliveries:[]};return this.state[ownerId];}
 addResource(ownerId,id,qty){const s=this.ensure(ownerId);s.resources[id]=(s.resources[id]||0)+Math.max(0,Number(qty)||0);this.persist();return s.resources[id];}
 has(ownerId,cost={}){const r=this.ensure(ownerId).resources;return Object.entries(cost).every(([id,q])=>(r[id]||0)>=q);}
 consume(ownerId,cost={}){if(!this.has(ownerId,cost))throw new Error('Recursos industriais insuficientes.');const s=this.ensure(ownerId);for(const [id,q] of Object.entries(cost))s.resources[id]-=q;this.persist();}
 addStock(ownerId,itemId,qty){const s=this.ensure(ownerId);s.stock[itemId]=(s.stock[itemId]||0)+qty;this.persist();return s.stock[itemId];}
 removeStock(ownerId,itemId,qty){const s=this.ensure(ownerId);if((s.stock[itemId]||0)<qty)throw new Error('Estoque industrial insuficiente.');s.stock[itemId]-=qty;this.persist();}
 logDelivery(ownerId,payload){this.ensure(ownerId).deliveries.push(payload);this.persist();}
 snapshot(ownerId){return structuredClone(this.ensure(ownerId));}
 persist(){saveIndustrialState(this.state);}
}
export const industrialInventory=new IndustrialInventory();

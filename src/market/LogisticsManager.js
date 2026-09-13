import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { JsonManager } from '../core/JsonManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
import { InventoryManager } from '../inventory/InventoryManager.js';
import { EconomyService } from '../economy/EconomyService.js';
import { StatisticsManager } from '../players/StatisticsManager.js';
import { MARKET_DATA_DIR } from '../config/settings.js';
import { MilitaryStorageManager } from '../industrial/MilitaryStorageManager.js';

const FILE = path.join(MARKET_DATA_DIR, 'shipments.json');
const clone = v => structuredClone(v);
const money = v => Math.round(Number(v) * 100) / 100;

export class LogisticsManager {
  constructor(){
    JsonManager.ensureFile(FILE, []);
    this.items = new ItemRegistry();
    this.inventory = new InventoryManager();
    this.economy = new EconomyService();
    this.statistics = new StatisticsManager();
    this.militaryStorage = new MilitaryStorageManager();
  }
  load(){ const d=JsonManager.load(FILE,[]); return Array.isArray(d)?d:[]; }
  save(d){ JsonManager.save(FILE,d); }
  get(id){ return clone(this.load().find(s=>s.id===String(id))??null); }
  listOpen(limit=25){ return this.load().filter(s=>s.status==='awaiting_carrier').sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at))).slice(0,limit).map(clone); }
  listUser(userId,limit=25){ const id=String(userId); return this.load().filter(s=>[s.buyer_id,s.seller_id,s.carrier_id].includes(id)).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).slice(0,limit).map(clone); }
  createFromTrade(trade){
    const all=this.load();
    const weight=money(this.items.getWeight(trade.item_id)*Number(trade.quantity));
    const reward=money(Math.max(0.01, Number(trade.logistics_reward ?? (Number(trade.fee||0)*0.35))));
    const shipment={
      id:randomUUID().replaceAll('-',''), trade_id:trade.id, item_id:trade.item_id,
      market_scope:String(trade.market_scope ?? 'local'),
      quantity:Number(trade.quantity), quality:Number(trade.quality||50), weight,
      buyer_id:String(trade.buyer_id), seller_id:String(trade.seller_id), carrier_id:null,
      origin_guild_id:trade.origin_guild_id ? String(trade.origin_guild_id) : null,
      origin_guild_name:trade.origin_guild_name ? String(trade.origin_guild_name) : null,
      destination_guild_id:trade.destination_guild_id ? String(trade.destination_guild_id) : null,
      destination_guild_name:trade.destination_guild_name ? String(trade.destination_guild_name) : null,
      reward, status:'awaiting_carrier', created_at:new Date().toISOString(), accepted_at:null, delivered_at:null
    };
    all.push(shipment); this.save(all); return clone(shipment);
  }
  accept(userId,shipmentId){
    const id=String(userId), all=this.load(), i=all.findIndex(s=>s.id===String(shipmentId));
    if(i<0)return [false,'Frete não encontrado.',null]; const s=all[i];
    if(s.status!=='awaiting_carrier')return [false,'Esse frete não está disponível.',null];
    if(id===s.buyer_id||id===s.seller_id)return [false,'Comprador e vendedor não podem transportar este próprio negócio.',null];
    s.carrier_id=id; s.status='in_transit'; s.accepted_at=new Date().toISOString(); this.save(all);
    this.statistics.increment(id,'freights_accepted',1); return [true,'Frete aceito. A carga está em trânsito.',clone(s)];
  }
  deliver(userId,shipmentId){
    const id=String(userId), all=this.load(), i=all.findIndex(s=>s.id===String(shipmentId));
    if(i<0)return [false,'Frete não encontrado.',null]; const s=all[i];
    if(s.status!=='in_transit')return [false,'Esse frete não está em trânsito.',null];
    if(s.carrier_id!==id)return [false,'Esse frete pertence a outro transportador.',null];
    const special=this.items.requiresSpecialStorage(s.item_id);
    const [added,msg]=special
      ? this.militaryStorage.addItem(s.buyer_id,this.items.getStorageType(s.item_id),s.item_id,s.quantity,s.quality)
      : this.inventory.addItem(s.buyer_id,s.item_id,s.quantity,s.quality);
    if(!added)return [false,`Entrega pendente: ${msg}`,clone(s)];
    this.economy.add(id,s.reward); s.status='delivered'; s.delivered_at=new Date().toISOString(); this.save(all);
    this.statistics.increment(id,'freights_delivered',1); this.statistics.increment(id,'money_earned',s.reward);
    this.statistics.increment(s.buyer_id,'market_deliveries_received',1);
    return [true,`Entrega concluída. Recompensa: $${s.reward.toFixed(2)}.`,clone(s)];
  }
}

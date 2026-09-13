import crypto from 'node:crypto';
import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { TRADES_DATA_DIR } from '../config/settings.js';
import { InventoryManager } from '../inventory/InventoryManager.js';
import { EconomyService } from '../economy/EconomyService.js';
import { ItemRegistry } from '../core/ItemRegistry.js';

const FILE=path.join(TRADES_DATA_DIR,'player_trades.json');
const clone=v=>structuredClone(v); const cash=v=>Math.round(Number(v??0)*100)/100;
export class PlayerTradeManager{
 constructor({inventory=new InventoryManager(),economy=new EconomyService(),items=new ItemRegistry()}={}){this.inventory=inventory;this.economy=economy;this.items=items;JsonManager.ensureFile(FILE,[]);}
 load(){const d=JsonManager.load(FILE,[]);return Array.isArray(d)?d:[];} save(d){JsonManager.save(FILE,d);} get(id){return clone(this.load().find(t=>t.id===String(id))??null);} listFor(userId){const u=String(userId);return this.load().filter(t=>t.proposer_id===u||t.target_id===u).map(clone);}
 quality(userId,itemId){return Number(this.inventory.listItems(userId).find(x=>x.id===itemId)?.quality??50);}
 validateLeg(itemId,qty,money){const q=Math.trunc(Number(qty??0)),m=cash(money);if(itemId){if(!this.items.get(itemId))throw new Error(`Item não encontrado: ${itemId}`);if(!this.items.isTradeable(itemId))throw new Error('Um dos itens não é negociável.');if(q<=0)throw new Error('Informe quantidade válida para o item.');}else if(q>0)throw new Error('Quantidade informada sem item.');if(m<0)throw new Error('Dinheiro inválido.');return {itemId:itemId?String(itemId):null,qty:q,money:m};}
 propose({guildId,proposerId,targetId,offerItemId=null,offerQuantity=0,offerMoney=0,requestItemId=null,requestQuantity=0,requestMoney=0}){
   const p=String(proposerId),t=String(targetId);if(p===t)throw new Error('Você não pode trocar consigo mesmo.');
   const offer=this.validateLeg(offerItemId,offerQuantity,offerMoney), req=this.validateLeg(requestItemId,requestQuantity,requestMoney); if(!offer.itemId&&!offer.money)throw new Error('A oferta precisa conter item ou dinheiro.'); if(!req.itemId&&!req.money)throw new Error('O pedido precisa conter item ou dinheiro.');
   if(offer.itemId&&this.inventory.getQuantity(p,offer.itemId)<offer.qty)throw new Error('Você não possui o item oferecido no inventário.'); if(this.economy.getBalance(p)<offer.money)throw new Error('Saldo insuficiente para reservar a oferta.');
   const offerQuality=offer.itemId?this.quality(p,offer.itemId):50; if(offer.itemId){const [ok,msg]=this.inventory.removeItem(p,offer.itemId,offer.qty);if(!ok)throw new Error(msg);} if(offer.money&&!this.economy.remove(p,offer.money)){if(offer.itemId)this.inventory.addItem(p,offer.itemId,offer.qty,offerQuality);throw new Error('Falha ao reservar o dinheiro.');}
   const now=new Date().toISOString(); const trade={id:`trade_${crypto.randomUUID()}`,guild_id:String(guildId??''),proposer_id:p,target_id:t,offer_item_id:offer.itemId,offer_quantity:offer.qty,offer_quality:offerQuality,offer_money:offer.money,request_item_id:req.itemId,request_quantity:req.qty,request_money:req.money,status:'pending',created_at:now,updated_at:now};const all=this.load();all.push(trade);this.save(all);return clone(trade);
 }
 refund(trade){if(trade.offer_item_id&&trade.offer_quantity>0){const [ok,msg]=this.inventory.addItem(trade.proposer_id,trade.offer_item_id,trade.offer_quantity,trade.offer_quality);if(!ok)throw new Error(`Não foi possível devolver item reservado: ${msg}`);}if(trade.offer_money>0)this.economy.add(trade.proposer_id,trade.offer_money);}
 setStatus(id,status){const all=this.load(),i=all.findIndex(t=>t.id===String(id));if(i<0)throw new Error('Troca não encontrada.');all[i].status=status;all[i].updated_at=new Date().toISOString();this.save(all);return clone(all[i]);}
 reject(userId,id){const tr=this.get(id);if(!tr||tr.status!=='pending')throw new Error('Troca pendente não encontrada.');if(String(userId)!==tr.target_id)throw new Error('Somente o destinatário pode recusar.');this.refund(tr);return this.setStatus(id,'rejected');}
 cancel(userId,id){const tr=this.get(id);if(!tr||tr.status!=='pending')throw new Error('Troca pendente não encontrada.');if(String(userId)!==tr.proposer_id)throw new Error('Somente quem propôs pode cancelar.');this.refund(tr);return this.setStatus(id,'cancelled');}
 accept(userId,id){const tr=this.get(id);if(!tr||tr.status!=='pending')throw new Error('Troca pendente não encontrada.');if(String(userId)!==tr.target_id)throw new Error('Somente o destinatário pode aceitar.');
   if(tr.request_item_id&&this.inventory.getQuantity(tr.target_id,tr.request_item_id)<tr.request_quantity)throw new Error('Você não possui o item solicitado no inventário.');if(this.economy.getBalance(tr.target_id)<tr.request_money)throw new Error('Saldo insuficiente para aceitar a troca.');
   const targetFree=this.inventory.getFreeCapacity(tr.target_id), proposerFree=this.inventory.getFreeCapacity(tr.proposer_id);const offerWeight=tr.offer_item_id?this.items.getWeight(tr.offer_item_id)*tr.offer_quantity:0,reqWeight=tr.request_item_id?this.items.getWeight(tr.request_item_id)*tr.request_quantity:0;if(targetFree<offerWeight)throw new Error('O destinatário não possui espaço para receber o item oferecido.');if(proposerFree<reqWeight)throw new Error('Quem propôs não possui espaço para receber o item solicitado.');
   const reqQuality=tr.request_item_id?this.quality(tr.target_id,tr.request_item_id):50;
   if(tr.request_item_id){const [ok,msg]=this.inventory.removeItem(tr.target_id,tr.request_item_id,tr.request_quantity);if(!ok)throw new Error(msg);}if(tr.request_money&&!this.economy.remove(tr.target_id,tr.request_money)){if(tr.request_item_id)this.inventory.addItem(tr.target_id,tr.request_item_id,tr.request_quantity,reqQuality);throw new Error('Falha ao reservar o dinheiro solicitado.');}
   if(tr.offer_item_id){const [ok,msg]=this.inventory.addItem(tr.target_id,tr.offer_item_id,tr.offer_quantity,tr.offer_quality);if(!ok)throw new Error(msg);}if(tr.request_item_id){const [ok,msg]=this.inventory.addItem(tr.proposer_id,tr.request_item_id,tr.request_quantity,reqQuality);if(!ok)throw new Error(msg);}if(tr.offer_money)this.economy.add(tr.target_id,tr.offer_money);if(tr.request_money)this.economy.add(tr.proposer_id,tr.request_money);
   return this.setStatus(id,'completed');
 }
}

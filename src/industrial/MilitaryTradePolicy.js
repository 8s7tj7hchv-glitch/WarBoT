import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { ItemRegistry } from '../core/ItemRegistry.js';
import { INDUSTRIAL_DATA_DIR } from '../config/settings.js';
const FILE=path.join(INDUSTRIAL_DATA_DIR,'trade_permits.json');
const CATEGORIES=['military_components','military_vehicles','aircraft','naval_vessels','submarines','missile_systems'];
export class MilitaryTradePolicy{
 constructor(){JsonManager.ensureFile(FILE,{});this.items=new ItemRegistry();}
 load(){return JsonManager.load(FILE,{})} save(v){JsonManager.save(FILE,v)} isMilitary(itemId){return CATEGORIES.includes(this.items.get(itemId)?.category)}
 getGuild(guildId){const d=this.load()?.[String(guildId)]??{};return {international_enabled:d.international_enabled!==false,allowed_categories:Array.isArray(d.allowed_categories)?d.allowed_categories:CATEGORIES.slice()};}
 setGuild(guildId,patch={}){const all=this.load(),k=String(guildId),cur=this.getGuild(k);all[k]={...cur,...patch,updated_at:new Date().toISOString()};this.save(all);return all[k];}
 canTrade(itemId,{international=false,guildId=null}={}){const item=this.items.get(itemId);if(!item)return [false,'Item não encontrado.'];if(!this.isMilitary(itemId))return [true,'Item civil.'];if(!item.tradeable)return [false,'Item estratégico não negociável.'];if(international){if(!guildId)return [false,'Servidor não informado.'];const policy=this.getGuild(guildId);if(!policy.international_enabled)return [false,'Comércio estratégico internacional desativado neste servidor.'];if(!policy.allowed_categories.includes(item.category))return [false,'Categoria estratégica bloqueada neste mercado.'];}return [true,'Negociação permitida.'];}
 categories(){return CATEGORIES.slice();}
}

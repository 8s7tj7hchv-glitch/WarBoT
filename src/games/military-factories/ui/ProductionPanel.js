import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getFactory } from '../core/FactoryRegistry.js';
import { getCatalog, getCatalogItem } from '../production/CatalogService.js';
import { factoryManager } from '../core/FactoryManager.js';

const status={queued:'⏳ Na fila',running:'⚙️ Em produção',completed:'✅ Concluída',cancelled:'❌ Cancelada'};
export function renderProductionCatalog(userId,factoryId){
 const meta=getFactory(factoryId); if(!meta) throw new Error('Fábrica inválida.');
 factoryManager.ensure(userId,factoryId); const items=getCatalog(factoryId);
 const embed=new EmbedBuilder().setTitle(`${meta.emoji} Produção — ${meta.name}`).setDescription('Escolha um produto fictício/abstrato para adicionar à fila.');
 const select=new StringSelectMenuBuilder().setCustomId(`mf:product:${factoryId}`).setPlaceholder('Escolha o produto').addOptions(items.map(x=>({label:x.name.slice(0,100),value:x.id,description:'Item fictício de jogo'})));
 const rows=[new ActionRowBuilder().addComponents(select),new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`mf:queue:${factoryId}`).setLabel('Ver fila').setEmoji('📋').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId(`mf:refresh:${factoryId}`).setLabel('Voltar').setEmoji('↩️').setStyle(ButtonStyle.Secondary))];
 return {embeds:[embed],components:rows};
}
export function renderProductConfirm(userId,factoryId,itemId){
 const meta=getFactory(factoryId), item=getCatalogItem(factoryId,itemId); if(!meta||!item) throw new Error('Produto inválido.');
 const f=factoryManager.ensure(userId,factoryId);
 const embed=new EmbedBuilder().setTitle(`${meta.emoji} ${item.name}`).setDescription('Produção abstrata do jogo. Nenhum processo real de fabricação é representado.').addFields({name:'📦 Quantidade',value:'1 unidade',inline:true},{name:'⚙️ Espaços',value:`${f.queue.filter(x=>['queued','running'].includes(x.status)).length}/${f.capacity}`,inline:true});
 const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`mf:add:${factoryId}:${itemId}`).setLabel('Adicionar à fila').setEmoji('➕').setStyle(ButtonStyle.Success),new ButtonBuilder().setCustomId(`mf:production:${factoryId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary));
 return {embeds:[embed],components:[row]};
}
export function renderQueue(userId,factoryId){
 const meta=getFactory(factoryId), f=factoryManager.ensure(userId,factoryId); if(!meta) throw new Error('Fábrica inválida.');
 const jobs=f.queue.slice(-10).reverse();
 const lines=jobs.length?jobs.map(j=>{const item=getCatalogItem(factoryId,j.itemId);return `${status[j.status]??j.status} • **${item?.name??j.itemId}** ×${j.quantity}\n\`${j.id}\``;}).join('\n\n'):'Nenhuma produção registrada.';
 const embed=new EmbedBuilder().setTitle(`📋 Fila — ${meta.name}`).setDescription(lines).addFields({name:'Capacidade ativa',value:`${f.queue.filter(x=>['queued','running'].includes(x.status)).length}/${f.capacity}`});
 const running=f.queue.find(x=>x.status==='running'), queued=f.queue.find(x=>x.status==='queued');
 const buttons=[]; if(!running&&queued) buttons.push(new ButtonBuilder().setCustomId(`mf:start:${factoryId}`).setLabel('Iniciar próxima').setEmoji('▶️').setStyle(ButtonStyle.Primary)); if(running) buttons.push(new ButtonBuilder().setCustomId(`mf:complete:${factoryId}:${running.id}`).setLabel('Concluir').setEmoji('✅').setStyle(ButtonStyle.Success)); buttons.push(new ButtonBuilder().setCustomId(`mf:production:${factoryId}`).setLabel('Produção').setEmoji('🏭').setStyle(ButtonStyle.Secondary));
 return {embeds:[embed],components:[new ActionRowBuilder().addComponents(buttons)]};
}

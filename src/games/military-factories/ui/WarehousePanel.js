import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { industrialWarehouseManager } from '../warehouse/IndustrialWarehouseManager.js';
import { industrialInventory } from '../inventory/IndustrialInventory.js';
import { INDUSTRIAL_RESOURCES } from '../resources/ResourceCatalog.js';

export function renderWarehousePanel(userId){
 const s=industrialWarehouseManager.status(userId);const inv=industrialInventory.snapshot(userId);
 const resources=Object.entries(inv.resources||{}).filter(([,q])=>q>0).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([id,q])=>`${INDUSTRIAL_RESOURCES[id]?.emoji??'📦'} ${INDUSTRIAL_RESOURCES[id]?.name??id}: **${q}**`).join('\n')||'Nenhum recurso armazenado.';
 const bar='█'.repeat(Math.round(s.percent/10))+'░'.repeat(10-Math.round(s.percent/10));
 const embed=new EmbedBuilder().setTitle('🏬 Armazém Industrial').setDescription('Gerencie a capacidade de recursos usada pelas linhas de produção.').addFields(
  {name:'📊 Ocupação',value:`${bar} ${s.percent}%\n**${s.used} / ${s.capacity}** unidades`,inline:false},
  {name:'🏗️ Nível',value:`${s.level}/${s.maxLevel}`,inline:true},{name:'📦 Espaço livre',value:String(s.free),inline:true},{name:'💰 Próxima expansão',value:s.nextCost?`${s.nextCost} créditos`:'Nível máximo',inline:true},
  {name:'📋 Recursos',value:resources,inline:false}
 );
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:warehouse:upgrade').setLabel('Expandir').setEmoji('⬆️').setStyle(ButtonStyle.Success).setDisabled(s.level>=s.maxLevel),
  new ButtonBuilder().setCustomId('mf:warehouse:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row]};
}

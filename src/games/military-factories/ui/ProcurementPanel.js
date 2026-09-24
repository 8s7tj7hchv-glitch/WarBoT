import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { procurementManager } from '../procurement/ProcurementManager.js';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';
export function renderProcurementPanel(userId){
 const items=procurementManager.list(userId); const balance=industrialEconomyManager.balance(userId);
 const embed=new EmbedBuilder().setTitle('🛒 Suprimentos Industriais').setDescription('Compre recursos totalmente fictícios do jogo para abastecer as linhas de produção.').addFields(
  {name:'💰 Créditos',value:balance.toLocaleString('pt-BR'),inline:true},
  {name:'📦 Estoque atual',value:items.map(x=>`${x.emoji} ${x.name}: **${x.stock}**`).join('\n').slice(0,1024)}
 );
 const select=new StringSelectMenuBuilder().setCustomId('mf:procurement:buy').setPlaceholder('Comprar pacote de suprimentos').addOptions(items.map(x=>({label:x.name.slice(0,100),value:x.id,emoji:x.emoji,description:`${x.pack} unidades • ${x.price} créditos`.slice(0,100)})));
 const row1=new ActionRowBuilder().addComponents(select);
 const row2=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:procurement:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row1,row2]};
}

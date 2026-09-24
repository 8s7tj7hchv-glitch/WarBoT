import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { industrialAlertsService } from '../alerts/IndustrialAlertsService.js';

export function renderIndustrialAlertsPanel(userId){
 const s=industrialAlertsService.summary(userId);
 const body=s.items.length?s.items.slice(0,15).map(a=>`${a.emoji} **${a.title}**\n${a.text}`).join('\n\n'):'✅ Nenhum alerta industrial no momento.';
 const embed=new EmbedBuilder().setTitle('🔔 CENTRAL DE ALERTAS INDUSTRIAIS').setDescription(body).addFields(
  {name:'🚨 Críticos',value:String(s.critical),inline:true},
  {name:'⚠️ Atenção',value:String(s.warning),inline:true},
  {name:'ℹ️ Informativos',value:String(s.info),inline:true}
 );
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:alerts:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row]};
}

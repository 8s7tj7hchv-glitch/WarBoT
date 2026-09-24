import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { monthlyIndustrialRewardManager } from '../rewards/MonthlyIndustrialRewardManager.js';
export function renderMonthlyRewardsPanel(userId){
 const s=monthlyIndustrialRewardManager.status(userId); const r=s.reward;
 const resources=Object.entries(r.resources).map(([k,v])=>`• ${k}: ${v}`).join('\n');
 const embed=new EmbedBuilder().setTitle('🗓️ RECOMPENSA INDUSTRIAL MENSAL').setDescription(s.available?'✅ Recompensa deste mês disponível.':'⏳ Recompensa deste mês já resgatada.').addFields(
  {name:'💰 Créditos Industriais',value:r.credits.toLocaleString('pt-BR'),inline:true},
  {name:'🏆 Resgates mensais',value:String(s.totalClaims),inline:true},
  {name:'📦 Recursos fictícios',value:resources}
 );
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:monthly:claim').setLabel('Resgatar').setEmoji('🎁').setStyle(ButtonStyle.Success).setDisabled(!s.available),
  new ButtonBuilder().setCustomId('mf:monthly:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:rewards').setLabel('Recompensas').setEmoji('🎁').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row]};
}

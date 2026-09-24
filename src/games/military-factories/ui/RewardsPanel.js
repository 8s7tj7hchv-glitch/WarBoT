import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { dailyIndustrialRewardManager } from '../rewards/DailyIndustrialRewardManager.js';
import { weeklyIndustrialRewardManager } from '../rewards/WeeklyIndustrialRewardManager.js';
import { monthlyIndustrialRewardManager } from '../rewards/MonthlyIndustrialRewardManager.js';
export function renderIndustrialRewardsPanel(userId){
 const d=dailyIndustrialRewardManager.status(userId), w=weeklyIndustrialRewardManager.status(userId), m=monthlyIndustrialRewardManager.status(userId);
 const mark=x=>x?'✅ Disponível':'⏳ Resgatada';
 const embed=new EmbedBuilder().setTitle('🎁 CENTRAL DE RECOMPENSAS INDUSTRIAIS').setDescription('Acompanhe e resgate as recompensas de atividade das Fábricas Militares.').addFields(
  {name:'🎁 Diária',value:mark(d.available),inline:true},{name:'📅 Semanal',value:mark(w.available),inline:true},{name:'🗓️ Mensal',value:mark(m.available),inline:true}
 );
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:daily').setLabel('Diária').setEmoji('🎁').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:weekly').setLabel('Semanal').setEmoji('📅').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:monthly').setLabel('Mensal').setEmoji('🗓️').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:rewards').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row]};
}

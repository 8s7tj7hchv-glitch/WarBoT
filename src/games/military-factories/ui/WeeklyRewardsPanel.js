import { ActionRowBuilder,ButtonBuilder,ButtonStyle,EmbedBuilder } from 'discord.js';
import { weeklyIndustrialRewardManager } from '../rewards/WeeklyIndustrialRewardManager.js';
export function renderWeeklyRewardsPanel(userId){
 const s=weeklyIndustrialRewardManager.status(userId); const r=s.reward;
 const resources=Object.entries(r.resources).map(([k,v])=>`• ${k}: +${v}`).join('\n');
 const embed=new EmbedBuilder().setTitle('📅 RECOMPENSA INDUSTRIAL SEMANAL').setDescription(s.available?'✅ Recompensa desta semana disponível.':'⏳ Recompensa desta semana já resgatada.').addFields(
  {name:'💰 Créditos Industriais',value:`+${r.credits.toLocaleString('pt-BR')}`,inline:true},
  {name:'📦 Recursos fictícios',value:resources||'—'},
  {name:'🗓️ Regra',value:'Um resgate por semana (UTC).'}
 );
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:weekly:claim').setLabel('Resgatar').setEmoji('🎁').setStyle(ButtonStyle.Success).setDisabled(!s.available),
  new ButtonBuilder().setCustomId('mf:weekly:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Voltar').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row]};
}

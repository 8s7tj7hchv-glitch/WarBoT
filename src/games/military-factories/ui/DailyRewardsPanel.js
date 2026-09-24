import { ActionRowBuilder,ButtonBuilder,ButtonStyle,EmbedBuilder } from 'discord.js';
import { dailyIndustrialRewardManager,DAILY_INDUSTRIAL_REWARDS } from '../rewards/DailyIndustrialRewardManager.js';
export function renderDailyRewardsPanel(userId){
 const s=dailyIndustrialRewardManager.status(userId);
 const lines=DAILY_INDUSTRIAL_REWARDS.map(r=>`${r.day===s.nextStreak?'➡️':'▫️'} **Dia ${r.day}** — 💰 ${r.credits.toLocaleString('pt-BR')} créditos`).join('\n');
 const embed=new EmbedBuilder().setTitle('🎁 Recompensa Industrial Diária').setDescription(lines).addFields(
  {name:'🔥 Sequência atual',value:`${s.streak} dia(s)`,inline:true},
  {name:'📦 Resgates totais',value:String(s.totalClaims),inline:true},
  {name:'🎁 Hoje',value:s.canClaim?'Disponível para resgate.':'Já resgatada.',inline:false},
  {name:'📋 Próxima recompensa',value:`💰 ${s.nextReward.credits.toLocaleString('pt-BR')} créditos\n📦 ${Object.entries(s.nextReward.resources).map(([k,v])=>`${k}: ${v}`).join(' • ')}`}
 );
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:daily:claim').setLabel('Resgatar').setEmoji('🎁').setStyle(ButtonStyle.Success).setDisabled(!s.canClaim),
  new ButtonBuilder().setCustomId('mf:daily:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row]};
}

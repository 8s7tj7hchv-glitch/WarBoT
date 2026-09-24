import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { industrialAchievementManager } from '../achievements/IndustrialAchievementManager.js';
import { factoryManager } from '../core/FactoryManager.js';
import { researchManager } from '../research/ResearchManager.js';

function stats(userId){
 const factories=factoryManager.list(userId); const completed=factories.reduce((n,f)=>n+Number(f.completed||0),0);
 const research=researchManager.profile?.(userId)??{};
 const researchMax=Math.max(0,...Object.values(research.levels||research.technologies||{}).map(Number).filter(Number.isFinite));
 return {factories:factories.length,completed,quality:0,research:researchMax,deliveries:0,contracts:0,masterCertifications:0};
}
export function renderAchievementsPanel(userId){
 const list=industrialAchievementManager.list(userId,stats(userId)); const p=industrialAchievementManager.profile(userId);
 const unlocked=list.filter(x=>x.unlocked).length;
 const lines=list.map(a=>`${a.unlocked?'✅':'🔒'} ${a.emoji} **${a.name}** — ${a.value}/${a.goal}\n${a.description}`).join('\n\n');
 const embed=new EmbedBuilder().setTitle('🏆 CONQUISTAS INDUSTRIAIS').setDescription(lines||'Nenhuma conquista configurada.').addFields(
  {name:'📊 Progresso',value:`${unlocked}/${list.length}`,inline:true},{name:'✨ XP Industrial',value:String(p.xp),inline:true},{name:'💳 Créditos',value:String(p.credits),inline:true},
  {name:'🏅 Títulos',value:p.titles.length?p.titles.join('\n'):'Nenhum título desbloqueado.'}
 );
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:achievements:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row]};
}

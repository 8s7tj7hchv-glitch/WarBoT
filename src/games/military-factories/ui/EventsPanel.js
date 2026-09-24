import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { industrialEventManager } from '../events/IndustrialEventManager.js';
export function renderIndustrialEventsPanel(){
 const e=industrialEventManager.active(); const m=e.modifiers; const next=industrialEventManager.nextChange();
 const effects=[m.energyDiscount?`⚡ Energia: -${Math.round(m.energyDiscount*100)}%`:null,m.qualityBonus?`⭐ Qualidade: +${m.qualityBonus}`:null,m.xpBonus?`👷 XP industrial: x${1+m.xpBonus}`:null].filter(Boolean).join('\n')||'Sem modificadores.';
 const embed=new EmbedBuilder().setTitle(`${e.emoji} EVENTO INDUSTRIAL`).setDescription(`**${e.name}**\n${e.description}`).addFields(
  {name:'🎛️ Efeitos ativos',value:effects},{name:'🗓️ Próxima rotação',value:`<t:${Math.floor(next.getTime()/1000)}:R>`}
 ).setFooter({text:'Eventos são mecânicas fictícias do jogo e mudam semanalmente.'});
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:events:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row]};
}

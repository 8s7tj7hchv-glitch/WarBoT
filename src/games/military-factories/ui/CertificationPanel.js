import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { getFactory } from '../core/FactoryRegistry.js';
import { certificationManager } from '../certifications/CertificationManager.js';

export function renderCertificationPanel(userId,factoryId){
 const meta=getFactory(factoryId); if(!meta) throw new Error('Fábrica inválida.');
 const s=certificationManager.status(userId,factoryId);
 const current=s.current?`${s.current.emoji} ${s.current.name}`:'⚪ Não certificada';
 const next=s.next?`${s.next.emoji} ${s.next.name}\nRequer ${s.next.minCompleted} produções concluídas e qualidade média ${s.next.minQuality}+`:'🏆 Certificação máxima alcançada';
 const tiers=certificationManager.tiers().map(t=>`${t.emoji} **${t.name}** — ${t.minCompleted} produções • qualidade ${t.minQuality}+`).join('\n');
 const embed=new EmbedBuilder().setTitle(`🏅 Certificação — ${meta.name}`).setDescription('Progressão industrial baseada em produção concluída e controle de qualidade.').addFields(
  {name:'🏷️ Certificação atual',value:current,inline:true},
  {name:'⚙️ Produções concluídas',value:String(s.completed),inline:true},
  {name:'⭐ Qualidade média',value:`${s.average}/100`,inline:true},
  {name:'🎯 Próxima certificação',value:next},
  {name:'📋 Níveis',value:tiers}
 );
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId(`mf:certification:${factoryId}`).setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId(`mf:refresh:${factoryId}`).setLabel('Voltar').setEmoji('↩️').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row]};
}

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { FACTORIES } from '../core/FactoryRegistry.js';
import { industrialPlanningManager } from '../planning/IndustrialPlanningManager.js';

const bar=p=>`${'█'.repeat(Math.floor(p/10))}${'░'.repeat(10-Math.floor(p/10))} ${p}%`;
export function renderPlanningPanel(userId){
 const active=FACTORIES.map(f=>({f,p:industrialPlanningManager.progress(userId,f.id)})).filter(x=>x.p?.status==='active');
 const lines=active.length?active.slice(0,10).map(({f,p})=>`${f.emoji} **${f.name}** — ${p.done}/${p.target} • ${bar(p.percent)}`).join('\n'):'Nenhuma meta ativa. Escolha uma fábrica para criar um plano.';
 const embed=new EmbedBuilder().setTitle('📋 Planejamento Industrial').setDescription('Defina metas de produção por fábrica. Ao concluir a meta, resgate Créditos Industriais.').addFields({name:'🎯 Metas ativas',value:lines});
 const select=new StringSelectMenuBuilder().setCustomId('mf:planning:select').setPlaceholder('Escolha uma fábrica').addOptions(FACTORIES.map(f=>({label:f.name.slice(0,100),value:f.id,emoji:f.emoji})));
 return {embeds:[embed],components:[new ActionRowBuilder().addComponents(select),new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('mf:planning:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary))]};
}
export function renderFactoryPlan(userId,factoryId){
 const f=FACTORIES.find(x=>x.id===factoryId);if(!f)throw new Error('Fábrica inválida.');
 const p=industrialPlanningManager.progress(userId,factoryId);
 const embed=new EmbedBuilder().setTitle(`📋 Plano — ${f.emoji} ${f.name}`);
 if(!p){embed.setDescription('Nenhuma meta criada para esta fábrica.');}
 else embed.addFields({name:'Status',value:p.status},{name:'Progresso',value:`${p.done}/${p.target}\n${bar(p.percent)}`},{name:'Recompensa',value:`💰 ${p.reward.toLocaleString('pt-BR')} créditos industriais`});
 const row=new ActionRowBuilder();
 if(!p||p.status!=='active')row.addComponents(new ButtonBuilder().setCustomId(`mf:planning:create:${factoryId}`).setLabel('Criar meta').setEmoji('🎯').setStyle(ButtonStyle.Success));
 if(p?.status==='active'){
  row.addComponents(new ButtonBuilder().setCustomId(`mf:planning:claim:${factoryId}`).setLabel('Resgatar').setEmoji('🎁').setStyle(ButtonStyle.Success).setDisabled(!p.ready));
  row.addComponents(new ButtonBuilder().setCustomId(`mf:planning:cancel:${factoryId}`).setLabel('Cancelar').setEmoji('✖️').setStyle(ButtonStyle.Danger));
 }
 row.addComponents(new ButtonBuilder().setCustomId('mf:planning').setLabel('Planejamento').setEmoji('📋').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary));
 return {embeds:[embed],components:[row]};
}

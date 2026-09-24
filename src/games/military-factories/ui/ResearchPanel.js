import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { TECHNOLOGIES, technologyCost } from '../research/TechnologyCatalog.js';
import { researchManager } from '../research/ResearchManager.js';
export function renderResearchPanel(userId){
 const s=researchManager.ensure(userId);
 const lines=TECHNOLOGIES.map(t=>{const l=s.levels[t.id]??0;const next=l>=t.maxLevel?'MÁXIMO':`${technologyCost(t,l)} pts`;return `${t.emoji} **${t.name}** — Nv. ${l}/${t.maxLevel} • ${next}`;}).join('\n');
 const embed=new EmbedBuilder().setTitle('🔬 CENTRO DE PESQUISA MILITAR').setDescription('Pesquisa totalmente fictícia e abstrata para progressão do jogo.').addFields({name:'🧪 Pontos de pesquisa',value:String(s.points),inline:true},{name:'📚 Tecnologias',value:lines});
 const select=new StringSelectMenuBuilder().setCustomId('mf:research:select').setPlaceholder('Escolha uma tecnologia').addOptions(TECHNOLOGIES.map(t=>({label:t.name,value:t.id,emoji:t.emoji,description:t.effect.slice(0,100)})));
 const row1=new ActionRowBuilder().addComponents(select);
 const row2=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId('mf:research').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary));
 return {embeds:[embed],components:[row1,row2]};
}
export function renderTechnology(userId,id){const t=TECHNOLOGIES.find(x=>x.id===id);if(!t)throw new Error('Tecnologia inválida.');const s=researchManager.ensure(userId),l=s.levels[id]??0,max=l>=t.maxLevel,cost=max?0:technologyCost(t,l);const embed=new EmbedBuilder().setTitle(`${t.emoji} ${t.name}`).setDescription(t.effect).addFields({name:'📈 Nível',value:`${l}/${t.maxLevel}`,inline:true},{name:'🧪 Pontos disponíveis',value:String(s.points),inline:true},{name:'💳 Próximo nível',value:max?'MÁXIMO':`${cost} pontos`,inline:true});const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`mf:research:upgrade:${id}`).setLabel(max?'Nível máximo':'Pesquisar').setEmoji('🔬').setStyle(ButtonStyle.Success).setDisabled(max),new ButtonBuilder().setCustomId('mf:research').setLabel('Voltar').setEmoji('↩️').setStyle(ButtonStyle.Secondary));return {embeds:[embed],components:[row]};}

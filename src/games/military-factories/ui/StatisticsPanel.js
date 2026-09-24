import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { industrialStatisticsManager } from '../statistics/IndustrialStatisticsManager.js';

export function renderIndustrialStatisticsPanel(userId){
 const s=industrialStatisticsManager.snapshot(userId);
 const factories=industrialStatisticsManager.factoryBreakdown(userId);
 const top=[...factories].sort((a,b)=>(b.completed-a.completed)||(b.level-a.level)).slice(0,5);
 const lines=top.map((f,i)=>`${i+1}. ${f.emoji} **${f.name}** — Nv. ${f.level} • ${f.completed} concluídas • ${f.active} ativas`);
 const embed=new EmbedBuilder()
  .setTitle('📈 Estatísticas Industriais')
  .setDescription('Resumo dinâmico do progresso nas Fábricas Militares.')
  .addFields(
   {name:'🏭 Fábricas',value:`${s.initialized}/${s.factoriesAvailable} inicializadas`,inline:true},
   {name:'📊 Nível médio',value:s.averageLevel.toFixed(1),inline:true},
   {name:'⚙️ Produções',value:`${s.completed} concluídas • ${s.active} ativas`,inline:true},
   {name:'🔬 Pesquisa',value:`${s.researchLevels} níveis acumulados`,inline:true},
   {name:'💰 Créditos',value:s.balance.toLocaleString('pt-BR'),inline:true},
   {name:'🏆 Destaques',value:lines.join('\n')||'Nenhuma atividade industrial ainda.'}
  );
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:statistics:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row]};
}

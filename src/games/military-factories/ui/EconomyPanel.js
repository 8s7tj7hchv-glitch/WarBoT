import { ActionRowBuilder,ButtonBuilder,ButtonStyle,EmbedBuilder } from 'discord.js';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';
function money(v){return `${Math.floor(Number(v)||0).toLocaleString('pt-BR')} CI`;}
export function renderIndustrialEconomyPanel(userId){
 const s=industrialEconomyManager.snapshot(userId);
 const history=s.transactions.length?s.transactions.slice(0,6).map(t=>`${t.amount>=0?'🟢':'🔴'} ${t.description} • ${t.amount>=0?'+':''}${money(t.amount)}`).join('\n'):'Nenhuma movimentação registrada.';
 const embed=new EmbedBuilder().setTitle('💰 ECONOMIA INDUSTRIAL').setDescription('Economia própria das Fábricas Militares. CI = Créditos Industriais fictícios do jogo.').addFields(
  {name:'💳 Saldo',value:money(s.balance),inline:true},{name:'📈 Recebido',value:money(s.totalEarned),inline:true},{name:'📉 Gasto',value:money(s.totalSpent),inline:true},{name:'🧾 Movimentações recentes',value:history}
 );
 const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('mf:economy:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId('mf:contracts').setLabel('Contratos').setEmoji('📑').setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary));
 return {embeds:[embed],components:[row]};
}

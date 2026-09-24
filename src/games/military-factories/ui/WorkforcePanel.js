import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { workforceManager, INDUSTRIAL_PROFESSIONS, INDUSTRIAL_SHIFTS } from '../workforce/WorkforceManager.js';
import { industrialEconomyManager } from '../economy/IndustrialEconomyManager.js';
export function renderWorkforcePanel(userId){
 const w=workforceManager.snapshot(userId); const prof=w.professionMeta?`${w.professionMeta.emoji} ${w.professionMeta.name}`:'Não definida';
 const embed=new EmbedBuilder().setTitle('👷 Gestão de Mão de Obra').setDescription('Gerencie trabalhadores, profissão industrial e turno de operação.').addFields(
  {name:'👥 Trabalhadores',value:String(w.workers),inline:true},{name:'❤️ Moral',value:`${w.morale}%`,inline:true},{name:'⚙️ Capacidade efetiva',value:String(w.capacity),inline:true},
  {name:'💼 Profissão',value:prof,inline:true},{name:'🕒 Turno',value:w.shiftMeta.name,inline:true},{name:'📈 Produtividade',value:`${Math.round(w.productivity*100)}%`,inline:true},
  {name:'✨ XP Industrial',value:String(w.xp),inline:true},{name:'💰 Saldo',value:`${industrialEconomyManager.balance(userId).toLocaleString('pt-BR')} créditos`,inline:true},{name:'📋 Contratação',value:`5 trabalhadores = ${(w.hireCost*5).toLocaleString('pt-BR')} créditos`,inline:true}
 );
 const profession=new StringSelectMenuBuilder().setCustomId('mf:workforce:profession').setPlaceholder('Escolher profissão').addOptions(Object.entries(INDUSTRIAL_PROFESSIONS).map(([id,p])=>({label:p.name,value:id,emoji:p.emoji})));
 const shift=new StringSelectMenuBuilder().setCustomId('mf:workforce:shift').setPlaceholder('Escolher turno').addOptions(Object.entries(INDUSTRIAL_SHIFTS).map(([id,s])=>({label:s.name,value:id,description:`Produtividade ${Math.round(s.factor*100)}%`})));
 const actions=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:workforce:hire').setLabel('Contratar +5').setEmoji('➕').setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId('mf:workforce:rest').setLabel('Descanso').setEmoji('❤️').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:workforce:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[new ActionRowBuilder().addComponents(profession),new ActionRowBuilder().addComponents(shift),actions]};
}

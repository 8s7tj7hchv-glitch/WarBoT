import {ActionRowBuilder,ButtonBuilder,ButtonStyle,StringSelectMenuBuilder} from 'discord.js';
export function buildManageSelector(items){
 if(!items.length)return {content:'📭 Nenhum sorteio encontrado.',components:[]};
 const menu=new StringSelectMenuBuilder().setCustomId('giveaway:manage:select').setPlaceholder('Selecione um sorteio')
  .addOptions(items.slice(0,25).map(g=>({label:String(g.prize).slice(0,100),value:g.id,description:`${g.status} • ${g.participants?.length||0} participante(s)`.slice(0,100)})));
 return {content:'🛠️ **Gerenciar Sorteios**',components:[new ActionRowBuilder().addComponents(menu)]};
}
export function buildManageActions(g){
 const r1=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId(`giveaway:edit:${g.id}`).setLabel('Editar').setEmoji('✏️').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId(`giveaway:end:${g.id}`).setLabel('Encerrar').setEmoji('🏁').setStyle(ButtonStyle.Danger),
  new ButtonBuilder().setCustomId(`giveaway:cancel:${g.id}`).setLabel('Cancelar').setEmoji('🚫').setStyle(ButtonStyle.Secondary)
 );
 const r2=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId(`giveaway:req:${g.id}`).setLabel('Requisitos').setEmoji('🔐').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId(`giveaway:entries:${g.id}`).setLabel('Entradas').setEmoji('🎟️').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId(`giveaway:delete:${g.id}`).setLabel('Excluir').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
 );
 return {content:`🎁 **${g.prize}**\nStatus: **${g.status}** • Participantes: **${g.participants?.length||0}**`,components:[r1,r2]};
}

import {ActionRowBuilder,ModalBuilder,TextInputBuilder,TextInputStyle} from 'discord.js';
export function buildEditGiveawayModal(g){
 const f=(id,label,value,style=TextInputStyle.Short)=>new TextInputBuilder().setCustomId(id).setLabel(label).setValue(String(value)).setRequired(true).setStyle(style);
 return new ModalBuilder().setCustomId(`giveaway:edit:submit:${g.id}`).setTitle('Editar Sorteio').addComponents(
  new ActionRowBuilder().addComponents(f('prize','Prêmio',g.prize)),
  new ActionRowBuilder().addComponents(f('description','Descrição',g.description,TextInputStyle.Paragraph)),
  new ActionRowBuilder().addComponents(f('winners','Vencedores',g.winnerCount))
 );
}

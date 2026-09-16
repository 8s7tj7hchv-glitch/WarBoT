import {ActionRowBuilder,ModalBuilder,TextInputBuilder,TextInputStyle} from 'discord.js';
const f=(id,label,ph,style=TextInputStyle.Short)=>new TextInputBuilder().setCustomId(id).setLabel(label).setPlaceholder(ph).setRequired(true).setStyle(style);
export function buildCreateGiveawayModal(){
 return new ModalBuilder().setCustomId('giveaway:create:submit').setTitle('Criar Sorteio').addComponents(
  new ActionRowBuilder().addComponents(f('prize','Prêmio','Discord Nitro')),
  new ActionRowBuilder().addComponents(f('description','Descrição','Descrição do sorteio',TextInputStyle.Paragraph)),
  new ActionRowBuilder().addComponents(f('duration','Duração','1h, 2d, 1w')),
  new ActionRowBuilder().addComponents(f('winners','Quantidade de vencedores','1'))
 );
}

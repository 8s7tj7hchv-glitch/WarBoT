import {ActionRowBuilder,ModalBuilder,TextInputBuilder,TextInputStyle} from 'discord.js';
const f=(id,label,ph,style=TextInputStyle.Short)=>new TextInputBuilder().setCustomId(id).setLabel(label).setPlaceholder(ph).setRequired(true).setStyle(style);
export function buildTemplateModal(){
 return new ModalBuilder().setCustomId('giveaway:template:submit').setTitle('Salvar Template').addComponents(
  new ActionRowBuilder().addComponents(f('name','Nome do template','nitro-semanal')),
  new ActionRowBuilder().addComponents(f('prize','Prêmio','Discord Nitro')),
  new ActionRowBuilder().addComponents(f('description','Descrição','Sorteio semanal',TextInputStyle.Paragraph)),
  new ActionRowBuilder().addComponents(f('duration','Duração','7d')),
  new ActionRowBuilder().addComponents(f('winners','Vencedores','1'))
 );
}

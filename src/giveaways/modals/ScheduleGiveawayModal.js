import {ActionRowBuilder,ModalBuilder,TextInputBuilder,TextInputStyle} from 'discord.js';
const f=(id,label,ph,style=TextInputStyle.Short)=>new TextInputBuilder().setCustomId(id).setLabel(label).setPlaceholder(ph).setRequired(true).setStyle(style);
export function buildScheduleGiveawayModal(){
 return new ModalBuilder().setCustomId('giveaway:schedule:submit').setTitle('Agendar Sorteio').addComponents(
  new ActionRowBuilder().addComponents(f('prize','Prêmio','Discord Nitro')),
  new ActionRowBuilder().addComponents(f('description','Descrição','Descrição do sorteio',TextInputStyle.Paragraph)),
  new ActionRowBuilder().addComponents(f('startDelay','Iniciar daqui a (ex.: 30m, 2h, 1d)','2h')),
  new ActionRowBuilder().addComponents(f('duration','Duração após iniciar (ex.: 1h, 7d)','7d')),
  new ActionRowBuilder().addComponents(f('winners','Quantidade de vencedores','1'))
 );
}

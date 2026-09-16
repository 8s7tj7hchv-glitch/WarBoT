import {ActionRowBuilder,StringSelectMenuBuilder} from 'discord.js';
export function buildScheduledPanel(items){
 if(!items.length)return {content:'📭 Nenhum sorteio agendado.',components:[]};
 const menu=new StringSelectMenuBuilder().setCustomId('giveaway:scheduled:select').setPlaceholder('Selecione um agendamento')
 .addOptions(items.slice(0,25).map(g=>({label:String(g.prize).slice(0,100),value:g.id,description:`Inicia ${new Date(g.startsAt).toLocaleString('pt-BR')}`.slice(0,100)})));
 return {content:'⏰ **Sorteios Agendados**\nSelecione para cancelar.',components:[new ActionRowBuilder().addComponents(menu)]};
}

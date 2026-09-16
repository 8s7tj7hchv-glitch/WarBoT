import {ActionRowBuilder,ButtonBuilder,ButtonStyle,StringSelectMenuBuilder} from 'discord.js';

export function buildRerollSelector(giveaways){
 if(!giveaways.length)return {content:'📭 Nenhum sorteio encerrado disponível para reroll.',components:[]};
 const select=new StringSelectMenuBuilder().setCustomId('giveaway:reroll:select')
  .setPlaceholder('Selecione um sorteio encerrado')
  .addOptions(giveaways.slice(0,25).map(g=>({
   label:String(g.prize).slice(0,100),value:g.id,
   description:`${g.winners?.length||0} vencedor(es) • ${g.participants.length} participante(s)`.slice(0,100)
  })));
 return {content:'🔄 **Reroll de Sorteios**',components:[new ActionRowBuilder().addComponents(select)]};
}

export function buildRerollActions(g){
 const winners=(g.winners||[]).map(id=>`<@${id}>`).join(', ')||'Nenhum';
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId(`giveaway:reroll:one:${g.id}`).setLabel('Reroll 1 vencedor').setEmoji('🎲').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId(`giveaway:reroll:all:${g.id}`).setLabel('Reroll completo').setEmoji('🔄').setStyle(ButtonStyle.Danger),
  new ButtonBuilder().setCustomId(`giveaway:history:${g.id}`).setLabel('Histórico').setEmoji('📜').setStyle(ButtonStyle.Secondary)
 );
 return {content:`🎁 **${g.prize}**\nVencedor(es): ${winners}`,components:[row]};
}

import {ActionRowBuilder,ButtonBuilder,ButtonStyle,EmbedBuilder} from 'discord.js';
export function buildPublicGiveaway(g){
 const ended=g.status!=='active';
 const embed=new EmbedBuilder().setTitle(`🎁 ${g.prize}`).setDescription(g.description)
 .addFields(
  {name:'🏆 Vencedores',value:String(g.winnerCount),inline:true},
  {name:'👥 Participantes',value:String(g.participants.length),inline:true},
  {name:'🎟️ Entradas',value:String(Object.values(g.participantEntries||{}).reduce((a,b)=>a+Number(b||0),0)),inline:true},
  {name:'Status',value:g.status==='ended'?'🏁 Encerrado':g.status==='cancelled'?'🚫 Cancelado':'🟢 Ativo',inline:true},
  {name:ended?'⏰ Finalizado':'⏰ Termina',value:ended?`<t:${Math.floor((g.endedAt||Date.now())/1000)}:R>`:`<t:${Math.floor(g.endsAt/1000)}:R>`}
 ).setFooter({text:`ID: ${g.id}`});
 if(g.status==='ended') embed.addFields({name:'🥳 Resultado',value:g.winners?.length?g.winners.map(id=>`<@${id}>`).join(', '):'Nenhum participante elegível.'});
 return {embeds:[embed],components:[new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId(`giveaway:join:${g.id}`).setLabel(ended?'Sorteio encerrado':'Participar')
  .setEmoji(ended?'🔒':'🎉').setStyle(ButtonStyle.Primary).setDisabled(ended),
  new ButtonBuilder().setCustomId(`giveaway:leave:${g.id}`).setLabel('Sair')
   .setEmoji('↩️').setStyle(ButtonStyle.Secondary).setDisabled(ended)
 )]};
}

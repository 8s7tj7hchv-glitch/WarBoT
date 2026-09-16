import {ActionRowBuilder,ButtonBuilder,ButtonStyle,EmbedBuilder} from 'discord.js';
export function buildGiveawayMainPanel(){
 const embed=new EmbedBuilder().setTitle('🎁 Painel de Sorteios').setDescription('Crie, gerencie, agende e audite sorteios.');
 const r1=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('giveaway:create').setLabel('Criar').setEmoji('➕').setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId('giveaway:manage').setLabel('Gerenciar').setEmoji('🛠️').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('giveaway:schedule').setLabel('Agendar').setEmoji('⏰').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('giveaway:scheduled').setLabel('Agendados').setEmoji('📅').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('giveaway:reroll').setLabel('Reroll').setEmoji('🔄').setStyle(ButtonStyle.Secondary)
 );
 const r2=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('giveaway:templates').setLabel('Templates').setEmoji('📋').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('giveaway:template:new').setLabel('Salvar Template').setEmoji('💾').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('giveaway:config').setLabel('Configurações').setEmoji('⚙️').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('giveaway:logs').setLabel('Logs').setEmoji('📊').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[r1,r2]};
}

import {ActionRowBuilder,ModalBuilder,TextInputBuilder,TextInputStyle} from 'discord.js';
const field=(id,label,value,ph)=>new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(TextInputStyle.Short).setRequired(false).setValue(value||'').setPlaceholder(ph);
export function buildConfigModal(c){
 return new ModalBuilder().setCustomId('giveaway:config:submit').setTitle('Configurações de Sorteios').addComponents(
  new ActionRowBuilder().addComponents(field('channel','ID do canal padrão',c.defaultChannelId,'123...')),
  new ActionRowBuilder().addComponents(field('adminRole','ID do cargo administrador',c.adminRoleId,'123...')),
  new ActionRowBuilder().addComponents(field('pingRole','ID do cargo de ping',c.pingRoleId,'123...')),
  new ActionRowBuilder().addComponents(field('message','Mensagem padrão',c.defaultMessage,'🎉 Novo sorteio!'))
 );
}

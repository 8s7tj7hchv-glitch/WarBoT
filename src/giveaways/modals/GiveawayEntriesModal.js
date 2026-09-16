import {ActionRowBuilder,ModalBuilder,TextInputBuilder,TextInputStyle} from 'discord.js';

export function buildEntriesModal(g) {
  const bonuses=Object.entries(g.entryConfig?.roleBonuses||{}).map(([id,n])=>`${id}:${n}`).join(',');
  const field=new TextInputBuilder()
    .setCustomId('roleBonuses').setLabel('Bônus por cargo: ID:EXTRAS')
    .setPlaceholder('123456789012345678:2,987654321098765432:5')
    .setRequired(false).setStyle(TextInputStyle.Paragraph).setValue(bonuses.slice(0,1000));
  return new ModalBuilder().setCustomId(`giveaway:entries:submit:${g.id}`)
    .setTitle('Entradas Extras').addComponents(new ActionRowBuilder().addComponents(field));
}

import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export function buildRequirementsModal(g) {
  const r=g.requirements||{};
  const input=(id,label,value,placeholder)=>new TextInputBuilder()
    .setCustomId(id).setLabel(label).setStyle(TextInputStyle.Short)
    .setRequired(false).setValue(value||'').setPlaceholder(placeholder);

  return new ModalBuilder()
    .setCustomId(`giveaway:req:submit:${g.id}`)
    .setTitle('Requisitos do Sorteio')
    .addComponents(
      new ActionRowBuilder().addComponents(input('requiredRoles','IDs dos cargos obrigatórios',(r.requiredRoleIds||[]).join(','),'123,456')),
      new ActionRowBuilder().addComponents(input('blockedRoles','IDs dos cargos proibidos',(r.blockedRoleIds||[]).join(','),'123,456')),
      new ActionRowBuilder().addComponents(input('accountDays','Idade mínima da conta (dias)',String(r.minAccountAgeDays||''),'7')),
      new ActionRowBuilder().addComponents(input('serverDays','Tempo mínimo no servidor (dias)',String(r.minServerAgeDays||''),'3'))
    );
}

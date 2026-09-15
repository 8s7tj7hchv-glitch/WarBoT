import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export function buildPriorityRow(current = 'normal') {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('ticket_priority')
    .setPlaceholder('🚦 Alterar prioridade')
    .addOptions(
      { label: 'Baixa', value: 'low', emoji: '🟢', default: current === 'low' },
      { label: 'Normal', value: 'normal', emoji: '🟡', default: current === 'normal' },
      { label: 'Alta', value: 'high', emoji: '🟠', default: current === 'high' },
      { label: 'Urgente', value: 'urgent', emoji: '🔴', default: current === 'urgent' }
    );

  return new ActionRowBuilder().addComponents(menu);
}

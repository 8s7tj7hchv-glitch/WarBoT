import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export function renderLogisticsPanel(shipments = []) {
  const active = shipments.filter(x => !['delivered','cancelled'].includes(x.status));
  const lines = active.slice(-10).map(s => `**${s.id}** • ${s.status} • ${s.progress}% • ${s.items.reduce((n,x)=>n+x.quantity,0)} item(ns)`);
  const embed = new EmbedBuilder()
    .setTitle('🚚 Logística Industrial')
    .setDescription(lines.length ? lines.join('\n') : 'Nenhuma entrega industrial ativa.')
    .addFields({ name: 'Fluxo', value: '📦 Estoque Industrial → 🚚 Transporte → 🏛️ Arsenal Nacional' });
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('mf:logistics:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mf:home').setLabel('Voltar').setEmoji('↩️').setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}

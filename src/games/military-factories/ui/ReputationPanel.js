import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { industrialReputationManager } from '../reputation/IndustrialReputationManager.js';

function progressBar(value, max, size = 10) {
  if (!max) return '██████████';
  const ratio = Math.max(0, Math.min(1, value / max));
  const filled = Math.round(ratio * size);
  return `${'█'.repeat(filled)}${'░'.repeat(size - filled)}`;
}

export function renderReputationPanel(userId) {
  const s = industrialReputationManager.snapshot(userId);
  const towardNext = s.next ? Math.max(0, s.score - s.tier.min) : 1;
  const span = s.next ? Math.max(1, s.next.min - s.tier.min) : 1;
  const nextText = s.next
    ? `${progressBar(towardNext, span)} ${s.score}/${s.next.min}\nPróximo: ${s.next.emoji} ${s.next.name}`
    : '██████████ Nível máximo de reputação industrial.';

  const embed = new EmbedBuilder()
    .setTitle('🌟 REPUTAÇÃO INDUSTRIAL')
    .setDescription(`${s.tier.emoji} **${s.tier.name}**\n${nextText}`)
    .addFields(
      { name: '🏅 Pontuação', value: String(s.score), inline: true },
      { name: '🏭 Fábricas', value: String(s.factories), inline: true },
      { name: '⚙️ Produções', value: String(s.completed), inline: true },
      { name: '⬆️ Níveis somados', value: String(s.factoryLevels), inline: true },
      { name: '🔬 Pesquisa somada', value: String(s.research), inline: true },
      { name: '🏆 Conquistas', value: String(s.achievements), inline: true }
    );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('mf:reputation:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { professionalTrainingManager } from '../training/ProfessionalTrainingManager.js';

export function renderTrainingPanel(userId) {
  const items = professionalTrainingManager.list(userId);
  const lines = items.map(x => `${x.profession.emoji} **${x.profession.name}** — Nv. ${x.level}/${x.maxLevel} • bônus industrial +${x.bonusPercent}%`);
  const embed = new EmbedBuilder()
    .setTitle('🎓 Treinamento Profissional')
    .setDescription('Aprimore as seis profissões industriais. Os bônus são abstratos e exclusivos da progressão do jogo.')
    .addFields({ name: '📚 Especializações', value: lines.join('\n') || 'Nenhuma.' });
  const select = new StringSelectMenuBuilder()
    .setCustomId('mf:training:select')
    .setPlaceholder('Escolha uma profissão')
    .addOptions(items.map(x => ({
      label: x.profession.name,
      value: x.professionId,
      emoji: x.profession.emoji,
      description: `${x.specialization.name} • Nv. ${x.level}/${x.maxLevel}`.slice(0, 100)
    })));
  const row1 = new ActionRowBuilder().addComponents(select);
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mf:training:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary)
  );
  return { embeds: [embed], components: [row1, row2] };
}

export function renderTrainingDetail(userId, professionId) {
  const x = professionalTrainingManager.snapshot(userId, professionId);
  const embed = new EmbedBuilder().setTitle(`${x.profession.emoji} ${x.profession.name}`).addFields(
    { name: '🎓 Especialização', value: x.specialization.name },
    { name: '📈 Nível', value: `${x.level}/${x.maxLevel}`, inline: true },
    { name: '⚙️ Bônus industrial', value: `+${x.bonusPercent}%`, inline: true },
    { name: '💰 Próximo treinamento', value: x.nextCost == null ? 'Nível máximo' : `${x.nextCost.toLocaleString('pt-BR')} créditos`, inline: true }
  );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`mf:training:upgrade:${professionId}`).setLabel('Treinar').setEmoji('🎓').setStyle(ButtonStyle.Success).setDisabled(x.level >= x.maxLevel),
    new ButtonBuilder().setCustomId('mf:training').setLabel('Profissões').setEmoji('👷').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}

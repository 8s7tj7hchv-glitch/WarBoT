import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

const typeLabel = (type) => type === 'paragraph' ? 'Texto longo' : 'Texto curto';

export function buildTicketFormsPanel(config, categoryId) {
  const item = (config.ticketTypes ?? []).find((entry) => entry.id === categoryId);
  if (!item) return null;

  const questions = item.formQuestions ?? [];
  const lines = questions.length
    ? questions.map((q, index) => `${index + 1}. **${q.label}** — ${typeLabel(q.type)} • ${q.required ? 'Obrigatória' : 'Opcional'}`)
    : ['Nenhuma pergunta configurada.'];

  const embed = new EmbedBuilder()
    .setTitle(`📝 Formulário • ${item.name}`)
    .setDescription(lines.join('\n'))
    .addFields({
      name: 'Limite',
      value: `${questions.length}/5 pergunta(s)`,
      inline: true,
    })
    .setFooter({ text: 'Ticket Avançado • Fase 5' })
    .setTimestamp();

  const components = [];

  if (questions.length) {
    components.push(new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`ticket:forms:select:${categoryId}`)
        .setPlaceholder('Selecione uma pergunta para editar')
        .addOptions(questions.map((q, index) => ({
          label: `${index + 1}. ${q.label}`.slice(0, 100),
          value: q.id,
          description: `${typeLabel(q.type)} • ${q.required ? 'Obrigatória' : 'Opcional'}`.slice(0, 100),
        }))),
    ));
  }

  components.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ticket:forms:create:${categoryId}`)
      .setLabel('Nova Pergunta')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Success)
      .setDisabled(questions.length >= 5),
    new ButtonBuilder()
      .setCustomId(`ticket:forms:clear:${categoryId}`)
      .setLabel('Limpar Formulário')
      .setEmoji('🧹')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!questions.length),
    new ButtonBuilder()
      .setCustomId(`ticket:categories:editor:${categoryId}`)
      .setLabel('Voltar')
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary),
  ));

  return { embeds: [embed], components };
}

export function buildTicketQuestionEditor(config, categoryId, questionId) {
  const item = (config.ticketTypes ?? []).find((entry) => entry.id === categoryId);
  const question = item?.formQuestions?.find((q) => q.id === questionId);
  if (!item || !question) return buildTicketFormsPanel(config, categoryId);

  const embed = new EmbedBuilder()
    .setTitle('✏️ Editar Pergunta')
    .setDescription(`**${question.label}**`)
    .addFields(
      { name: 'Tipo', value: typeLabel(question.type), inline: true },
      { name: 'Obrigatória', value: question.required ? 'Sim' : 'Não', inline: true },
      { name: 'Placeholder', value: question.placeholder || 'Nenhum', inline: false },
    )
    .setFooter({ text: `Categoria: ${item.name}` })
    .setTimestamp();

  const typeSelect = new StringSelectMenuBuilder()
    .setCustomId(`ticket:forms:type:${categoryId}:${questionId}`)
    .setPlaceholder('Alterar tipo da resposta')
    .addOptions(
      { label: 'Texto curto', value: 'short', emoji: '✏️', default: question.type === 'short' },
      { label: 'Texto longo', value: 'paragraph', emoji: '📄', default: question.type === 'paragraph' },
    );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(typeSelect),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket:forms:edit:${categoryId}:${questionId}`)
          .setLabel('Editar Texto')
          .setEmoji('✏️')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`ticket:forms:required:${categoryId}:${questionId}`)
          .setLabel(question.required ? 'Tornar Opcional' : 'Tornar Obrigatória')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`ticket:forms:delete:${categoryId}:${questionId}`)
          .setLabel('Excluir')
          .setEmoji('🗑️')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`ticket:forms:open:${categoryId}`)
          .setLabel('Voltar')
          .setEmoji('⬅️')
          .setStyle(ButtonStyle.Secondary),
      ),
    ],
  };
}

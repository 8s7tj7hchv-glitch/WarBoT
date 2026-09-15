import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } from 'discord.js';

import { createTicketFromForm } from '../services/ticketCreateService.js';
import { getTicketConfig } from '../config/ticketConfig.js';

function getCategoryById(cfg, categoryId) {
  return cfg?.ticketTypes?.find(
    category => String(category.id) === String(categoryId)
  ) ?? null;
}

function getQuestions(category) {
  return (
    category?.formQuestions ||
    category?.questions ||
    category?.form ||
    []
  ).slice(0, 5);
}

export async function handleOpenTicket(interaction, categoryId) {
  const cfg = getTicketConfig(interaction.guildId);

  if (!cfg?.enabled) {
    return interaction.reply({
      content: '❌ O sistema de tickets está desativado.',
      flags: MessageFlags.Ephemeral
    });
  }

  const category = getCategoryById(cfg, categoryId);

  if (!category) {
    return interaction.reply({
      content: '❌ Categoria de ticket não encontrada.',
      flags: MessageFlags.Ephemeral
    });
  }

  const questions = getQuestions(category);

  if (!questions.length) {
    return createTicketFromForm(
      interaction,
      cfg,
      category,
      []
    );
  }

  const modal = new ModalBuilder()
    .setCustomId(`ticket_form:${category.id}`)
    .setTitle(
      `Abrir ${String(category.name || 'Ticket').slice(0, 35)}`
    );

  questions.forEach((q, index) => {
    const input = new TextInputBuilder()
      .setCustomId(`q${index}`)
      .setLabel(
        String(
          q.label ||
          q.question ||
          `Pergunta ${index + 1}`
        ).slice(0, 45)
      )
      .setStyle(
        q.type === 'long' ||
        q.type === 'paragraph' ||
        q.style === 'paragraph'
          ? TextInputStyle.Paragraph
          : TextInputStyle.Short
      )
      .setRequired(q.required !== false);

    if (q.placeholder) {
      input.setPlaceholder(
        String(q.placeholder).slice(0, 100)
      );
    }

    modal.addComponents(
      new ActionRowBuilder().addComponents(input)
    );
  });

  return interaction.showModal(modal);
}

export async function handleTicketForm(interaction, categoryId) {
  const cfg = getTicketConfig(interaction.guildId);

  if (!cfg) {
    return interaction.reply({
      content: '❌ Configuração do ticket não encontrada.',
      flags: MessageFlags.Ephemeral
    });
  }

  const category = getCategoryById(cfg, categoryId);

  if (!category) {
    return interaction.reply({
      content: '❌ Categoria de ticket não encontrada.',
      flags: MessageFlags.Ephemeral
    });
  }

  const questions = getQuestions(category);

  const answers = questions.map((q, index) => ({
    label:
      q.label ||
      q.question ||
      `Pergunta ${index + 1}`,

    value: interaction.fields.getTextInputValue(
      `q${index}`
    )
  }));

  return createTicketFromForm(
    interaction,
    cfg,
    category,
    answers
  );
}
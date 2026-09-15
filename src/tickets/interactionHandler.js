import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import {
  getTicketConfig,
  resetTicketConfig,
  ticketConfigStatus,
  updateTicketConfig,
} from './config/ticketConfig.js';
import { buildTicketAdminPanel } from './panels/adminPanel.js';
import { buildTicketConfigPanel, buildTicketMoreConfigPanel } from './panels/configPanel.js';
import { buildTicketCustomizationPanel } from './panels/customizationPanel.js';
import { buildPublicTicketPanel } from './panels/publicPanel.js';
import { buildTicketCategoriesPanel, buildTicketCategoryEditor } from './panels/categoriesPanel.js';
import { buildTicketFormsPanel, buildTicketQuestionEditor } from './panels/formsPanel.js';
import { canManageTickets } from './utils/ticketPermissions.js';

const missingLabels = {
  panelChannelId: 'Canal do painel',
  ticketCategoryId: 'Categoria dos tickets',
  logChannelId: 'Canal de logs',
  supportRoleId: 'Cargo da equipe',
};


function makeCategoryId() {
  return Math.random().toString(36).slice(2, 10);
}

function makeQuestionId() {
  return Math.random().toString(36).slice(2, 10);
}

function buildQuestionModal(customId, title, question = {}) {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title);
  const label = new TextInputBuilder()
    .setCustomId('label')
    .setLabel('Pergunta')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(45)
    .setValue(question.label || '');
  const placeholder = new TextInputBuilder()
    .setCustomId('placeholder')
    .setLabel('Placeholder (opcional)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(100)
    .setValue(question.placeholder || '');
  modal.addComponents(
    new ActionRowBuilder().addComponents(label),
    new ActionRowBuilder().addComponents(placeholder),
  );
  return modal;
}

function buildCategoryModal(customId, title, item = {}) {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title);
  const name = new TextInputBuilder().setCustomId('name').setLabel('Nome da categoria').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(80).setValue(item.name || '');
  const emoji = new TextInputBuilder().setCustomId('emoji').setLabel('Emoji (opcional)').setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(100).setValue(item.emoji || '');
  const description = new TextInputBuilder().setCustomId('description').setLabel('Descrição').setStyle(TextInputStyle.Paragraph).setRequired(false).setMaxLength(1000).setValue(item.description || '');
  const limit = new TextInputBuilder().setCustomId('maxOpenTickets').setLabel('Limite por usuário (1-20)').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(2).setValue(String(item.maxOpenTickets ?? 1));
  modal.addComponents(
    new ActionRowBuilder().addComponents(name),
    new ActionRowBuilder().addComponents(emoji),
    new ActionRowBuilder().addComponents(description),
    new ActionRowBuilder().addComponents(limit),
  );
  return modal;
}

const denied = (interaction) => interaction.reply({
  content: '❌ Você não possui permissão para administrar os tickets.',
  flags: MessageFlags.Ephemeral,
});

function validHexColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function validOptionalUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildTextModal(config) {
  const modal = new ModalBuilder().setCustomId('ticket:customize:textModal').setTitle('Textos do Painel');
  const title = new TextInputBuilder().setCustomId('panelTitle').setLabel('Título').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(256).setValue(config.panelTitle || '🎫 Central de Atendimento');
  const description = new TextInputBuilder().setCustomId('panelDescription').setLabel('Descrição').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(4000).setValue(config.panelDescription || 'Precisa de ajuda? Clique no botão abaixo para abrir um ticket.');
  const footer = new TextInputBuilder().setCustomId('panelFooter').setLabel('Footer / Rodapé').setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(2048).setValue(config.panelFooter || '');
  modal.addComponents(
    new ActionRowBuilder().addComponents(title),
    new ActionRowBuilder().addComponents(description),
    new ActionRowBuilder().addComponents(footer),
  );
  return modal;
}

function buildVisualModal(config) {
  const modal = new ModalBuilder().setCustomId('ticket:customize:visualModal').setTitle('Visual do Painel');
  const color = new TextInputBuilder().setCustomId('panelColor').setLabel('Cor HEX (ex.: #5865F2)').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(7).setValue(config.panelColor || '#5865F2');
  const thumbnail = new TextInputBuilder().setCustomId('panelThumbnail').setLabel('URL da thumbnail (opcional)').setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(1000).setValue(config.panelThumbnail || '');
  const image = new TextInputBuilder().setCustomId('panelImage').setLabel('URL da imagem grande (opcional)').setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(1000).setValue(config.panelImage || '');
  modal.addComponents(
    new ActionRowBuilder().addComponents(color),
    new ActionRowBuilder().addComponents(thumbnail),
    new ActionRowBuilder().addComponents(image),
  );
  return modal;
}

function buildButtonModal(config) {
  const modal = new ModalBuilder().setCustomId('ticket:customize:buttonModal').setTitle('Botão do Painel');
  const label = new TextInputBuilder().setCustomId('openButtonLabel').setLabel('Texto do botão').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(80).setValue(config.openButtonLabel || 'Abrir Ticket');
  const emoji = new TextInputBuilder().setCustomId('openButtonEmoji').setLabel('Emoji do botão (opcional)').setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(100).setValue(config.openButtonEmoji || '');
  modal.addComponents(
    new ActionRowBuilder().addComponents(label),
    new ActionRowBuilder().addComponents(emoji),
  );
  return modal;
}

export async function handleTicketInteraction(interaction) {
  if (!interaction.customId?.startsWith('ticket:')) return false;
  if (!interaction.inGuild()) return true;

  // O botão público ainda não cria tickets nesta fase. A criação chega na FASE 6.
  if (interaction.customId === 'ticket:public:open') {
    await interaction.reply({
      content: 'ℹ️ A abertura real do ticket será adicionada na **FASE 6 — Criação do Ticket**.',
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  let config = getTicketConfig(interaction.guildId);
  if (!canManageTickets(interaction.member, config)) {
    await denied(interaction);
    return true;
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'ticket:admin:toggle') {
      config = updateTicketConfig(interaction.guildId, { enabled: !config.enabled });
      await interaction.update(buildTicketAdminPanel(config));
      return true;
    }

    if (interaction.customId === 'ticket:admin:status') {
      const status = ticketConfigStatus(config);
      const embed = new EmbedBuilder()
        .setTitle('📋 Status do Sistema de Tickets')
        .setDescription(config.enabled ? '🟢 Sistema ativado' : '🔴 Sistema desativado')
        .addFields({
          name: status.ready ? '✅ Configuração pronta' : '⚠️ Configuração incompleta',
          value: status.ready
            ? 'Todos os itens obrigatórios foram configurados.'
            : status.missing.map((key) => `• ${missingLabels[key] ?? key}`).join('\n'),
        })
        .setTimestamp();
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return true;
    }

    if (interaction.customId === 'ticket:admin:configure' || interaction.customId === 'ticket:config:main') {
      await interaction.update(buildTicketConfigPanel(config));
      return true;
    }

    if (interaction.customId === 'ticket:admin:customize') {
      await interaction.update(buildTicketCustomizationPanel(config));
      return true;
    }

    if (interaction.customId === 'ticket:admin:categories') {
      await interaction.update(buildTicketCategoriesPanel(config));
      return true;
    }

    if (interaction.customId === 'ticket:categories:list') {
      await interaction.update(buildTicketCategoriesPanel(config));
      return true;
    }

    if (interaction.customId.startsWith('ticket:categories:editor:')) {
      const id = interaction.customId.split(':').at(-1);
      await interaction.update(buildTicketCategoryEditor(config, id));
      return true;
    }

    if (interaction.customId.startsWith('ticket:forms:open:')) {
      const categoryId = interaction.customId.split(':').at(-1);
      const panel = buildTicketFormsPanel(config, categoryId);
      if (!panel) {
        await interaction.reply({ content: '❌ Categoria não encontrada.', flags: MessageFlags.Ephemeral });
        return true;
      }
      await interaction.update(panel);
      return true;
    }

    if (interaction.customId.startsWith('ticket:forms:create:')) {
      const categoryId = interaction.customId.split(':').at(-1);
      const item = (config.ticketTypes ?? []).find((entry) => entry.id === categoryId);
      if (!item) {
        await interaction.reply({ content: '❌ Categoria não encontrada.', flags: MessageFlags.Ephemeral });
        return true;
      }
      if ((item.formQuestions ?? []).length >= 5) {
        await interaction.reply({ content: '❌ Este formulário já possui 5 perguntas.', flags: MessageFlags.Ephemeral });
        return true;
      }
      await interaction.showModal(buildQuestionModal(`ticket:forms:createModal:${categoryId}`, 'Nova Pergunta'));
      return true;
    }

    if (interaction.customId.startsWith('ticket:forms:edit:')) {
      const [, , , categoryId, questionId] = interaction.customId.split(':');
      const item = (config.ticketTypes ?? []).find((entry) => entry.id === categoryId);
      const question = item?.formQuestions?.find((q) => q.id === questionId);
      if (!question) {
        await interaction.reply({ content: '❌ Pergunta não encontrada.', flags: MessageFlags.Ephemeral });
        return true;
      }
      await interaction.showModal(buildQuestionModal(`ticket:forms:editModal:${categoryId}:${questionId}`, 'Editar Pergunta', question));
      return true;
    }

    if (interaction.customId.startsWith('ticket:forms:required:')) {
      const parts = interaction.customId.split(':');
      const categoryId = parts[3];
      const questionId = parts[4];
      const list = (config.ticketTypes ?? []).map((entry) => {
        if (entry.id !== categoryId) return entry;
        return {
          ...entry,
          formQuestions: (entry.formQuestions ?? []).map((q) => q.id === questionId ? { ...q, required: !q.required } : q),
        };
      });
      config = updateTicketConfig(interaction.guildId, { ticketTypes: list });
      await interaction.update(buildTicketQuestionEditor(config, categoryId, questionId));
      return true;
    }

    if (interaction.customId.startsWith('ticket:forms:delete:')) {
      const parts = interaction.customId.split(':');
      const categoryId = parts[3];
      const questionId = parts[4];
      const list = (config.ticketTypes ?? []).map((entry) => entry.id === categoryId
        ? { ...entry, formQuestions: (entry.formQuestions ?? []).filter((q) => q.id !== questionId) }
        : entry);
      config = updateTicketConfig(interaction.guildId, { ticketTypes: list });
      await interaction.update(buildTicketFormsPanel(config, categoryId));
      return true;
    }

    if (interaction.customId.startsWith('ticket:forms:clear:')) {
      const categoryId = interaction.customId.split(':').at(-1);
      const list = (config.ticketTypes ?? []).map((entry) => entry.id === categoryId ? { ...entry, formQuestions: [] } : entry);
      config = updateTicketConfig(interaction.guildId, { ticketTypes: list });
      await interaction.update(buildTicketFormsPanel(config, categoryId));
      return true;
    }

    if (interaction.customId === 'ticket:categories:back') {
      await interaction.update(buildTicketAdminPanel(config));
      return true;
    }

    if (interaction.customId === 'ticket:categories:create') {
      if ((config.ticketTypes ?? []).length >= 25) {
        await interaction.reply({ content: '❌ Limite de 25 categorias atingido.', flags: MessageFlags.Ephemeral });
        return true;
      }
      await interaction.showModal(buildCategoryModal('ticket:categories:createModal', 'Nova Categoria'));
      return true;
    }

    if (interaction.customId.startsWith('ticket:categories:edit:')) {
      const id = interaction.customId.split(':').at(-1);
      const item = (config.ticketTypes ?? []).find((entry) => entry.id === id);
      if (!item) {
        await interaction.reply({ content: '❌ Categoria não encontrada.', flags: MessageFlags.Ephemeral });
        return true;
      }
      await interaction.showModal(buildCategoryModal(`ticket:categories:editModal:${id}`, 'Editar Categoria', item));
      return true;
    }

    if (interaction.customId.startsWith('ticket:categories:delete:')) {
      const id = interaction.customId.split(':').at(-1);
      config = updateTicketConfig(interaction.guildId, { ticketTypes: (config.ticketTypes ?? []).filter((entry) => entry.id !== id) });
      await interaction.update(buildTicketCategoriesPanel(config));
      return true;
    }

    if (interaction.customId.startsWith('ticket:categories:clearRole:')) {
      const id = interaction.customId.split(':').at(-1);
      const list = (config.ticketTypes ?? []).map((entry) => entry.id === id ? { ...entry, supportRoleId: null } : entry);
      config = updateTicketConfig(interaction.guildId, { ticketTypes: list });
      await interaction.update(buildTicketCategoryEditor(config, id));
      return true;
    }

    if (interaction.customId.startsWith('ticket:categories:clearChannel:')) {
      const id = interaction.customId.split(':').at(-1);
      const list = (config.ticketTypes ?? []).map((entry) => entry.id === id ? { ...entry, discordCategoryId: null } : entry);
      config = updateTicketConfig(interaction.guildId, { ticketTypes: list });
      await interaction.update(buildTicketCategoryEditor(config, id));
      return true;
    }

    if (interaction.customId === 'ticket:config:more') {
      await interaction.update(buildTicketMoreConfigPanel(config));
      return true;
    }

    if (interaction.customId === 'ticket:config:back' || interaction.customId === 'ticket:customize:back') {
      await interaction.update(buildTicketAdminPanel(config));
      return true;
    }

    if (interaction.customId === 'ticket:config:reset') {
      config = resetTicketConfig(interaction.guildId);
      await interaction.update(buildTicketMoreConfigPanel(config));
      return true;
    }

    if (interaction.customId === 'ticket:config:limits') {
      const modal = new ModalBuilder().setCustomId('ticket:config:limitsModal').setTitle('Limites dos Tickets');
      const max = new TextInputBuilder().setCustomId('maxOpenTickets').setLabel('Máximo de tickets por usuário (1-20)').setStyle(TextInputStyle.Short).setRequired(true).setValue(String(config.maxOpenTickets)).setMaxLength(2);
      const cooldown = new TextInputBuilder().setCustomId('cooldownSeconds').setLabel('Cooldown em segundos (0-86400)').setStyle(TextInputStyle.Short).setRequired(true).setValue(String(config.cooldownSeconds)).setMaxLength(5);
      modal.addComponents(new ActionRowBuilder().addComponents(max), new ActionRowBuilder().addComponents(cooldown));
      await interaction.showModal(modal);
      return true;
    }

    if (interaction.customId === 'ticket:customize:text') {
      await interaction.showModal(buildTextModal(config));
      return true;
    }

    if (interaction.customId === 'ticket:customize:visual') {
      await interaction.showModal(buildVisualModal(config));
      return true;
    }

    if (interaction.customId === 'ticket:customize:button') {
      await interaction.showModal(buildButtonModal(config));
      return true;
    }

    if (interaction.customId === 'ticket:customize:preview') {
      await interaction.reply({
        ...buildPublicTicketPanel(config, { preview: true }),
        flags: MessageFlags.Ephemeral,
      });
      return true;
    }

    if (interaction.customId === 'ticket:customize:reset') {
      config = updateTicketConfig(interaction.guildId, {
        panelTitle: '🎫 Central de Atendimento',
        panelDescription: 'Precisa de ajuda? Clique no botão abaixo para abrir um ticket.',
        panelColor: '#5865F2',
        panelThumbnail: null,
        panelImage: null,
        panelFooter: 'Sistema de Tickets',
        openButtonLabel: 'Abrir Ticket',
        openButtonEmoji: '🎫',
        openButtonStyle: 'Primary',
      });
      await interaction.update(buildTicketCustomizationPanel(config));
      return true;
    }
  }

  if (interaction.isChannelSelectMenu()) {
    const map = {
      'ticket:config:panelChannel': 'panelChannelId',
      'ticket:config:ticketCategory': 'ticketCategoryId',
      'ticket:config:logChannel': 'logChannelId',
    };
    const key = map[interaction.customId];
    if (key) {
      config = updateTicketConfig(interaction.guildId, { [key]: interaction.values[0] });
      await interaction.update(buildTicketConfigPanel(config));
      return true;
    }
  }

  if (interaction.isChannelSelectMenu() && interaction.customId.startsWith('ticket:categories:discordCategory:')) {
    const id = interaction.customId.split(':').at(-1);
    const list = (config.ticketTypes ?? []).map((entry) => entry.id === id ? { ...entry, discordCategoryId: interaction.values[0] } : entry);
    config = updateTicketConfig(interaction.guildId, { ticketTypes: list });
    await interaction.update(buildTicketCategoryEditor(config, id));
    return true;
  }

  if (interaction.isRoleSelectMenu() && interaction.customId.startsWith('ticket:categories:role:')) {
    const id = interaction.customId.split(':').at(-1);
    const list = (config.ticketTypes ?? []).map((entry) => entry.id === id ? { ...entry, supportRoleId: interaction.values[0] } : entry);
    config = updateTicketConfig(interaction.guildId, { ticketTypes: list });
    await interaction.update(buildTicketCategoryEditor(config, id));
    return true;
  }

  if (interaction.isRoleSelectMenu()) {
    const map = {
      'ticket:config:supportRole': 'supportRoleId',
      'ticket:config:adminRole': 'adminRoleId',
    };
    const key = map[interaction.customId];
    if (key) {
      config = updateTicketConfig(interaction.guildId, { [key]: interaction.values[0] });
      await interaction.update(key === 'adminRoleId' ? buildTicketMoreConfigPanel(config) : buildTicketConfigPanel(config));
      return true;
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket:categories:select') {
    await interaction.update(buildTicketCategoryEditor(config, interaction.values[0]));
    return true;
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('ticket:forms:select:')) {
    const categoryId = interaction.customId.split(':').at(-1);
    await interaction.update(buildTicketQuestionEditor(config, categoryId, interaction.values[0]));
    return true;
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('ticket:forms:type:')) {
    const parts = interaction.customId.split(':');
    const categoryId = parts[3];
    const questionId = parts[4];
    const list = (config.ticketTypes ?? []).map((entry) => entry.id === categoryId
      ? { ...entry, formQuestions: (entry.formQuestions ?? []).map((q) => q.id === questionId ? { ...q, type: interaction.values[0] } : q) }
      : entry);
    config = updateTicketConfig(interaction.guildId, { ticketTypes: list });
    await interaction.update(buildTicketQuestionEditor(config, categoryId, questionId));
    return true;
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket:customize:buttonStyle') {
    config = updateTicketConfig(interaction.guildId, { openButtonStyle: interaction.values[0] });
    await interaction.update(buildTicketCustomizationPanel(config));
    return true;
  }


  if (interaction.isModalSubmit() && interaction.customId === 'ticket:categories:createModal') {
    const limit = Number(interaction.fields.getTextInputValue('maxOpenTickets'));
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      await interaction.reply({ content: '❌ O limite precisa ser um número entre 1 e 20.', flags: MessageFlags.Ephemeral });
      return true;
    }
    const item = {
      id: makeCategoryId(),
      name: interaction.fields.getTextInputValue('name').trim(),
      emoji: interaction.fields.getTextInputValue('emoji').trim() || null,
      description: interaction.fields.getTextInputValue('description').trim() || null,
      maxOpenTickets: limit,
      supportRoleId: null,
      discordCategoryId: null,
      formQuestions: [],
    };
    config = updateTicketConfig(interaction.guildId, { ticketTypes: [...(config.ticketTypes ?? []), item] });
    await interaction.reply({ content: `✅ Categoria **${item.name}** criada. Volte ao painel de categorias para configurar cargo e categoria do Discord.`, flags: MessageFlags.Ephemeral });
    return true;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket:categories:editModal:')) {
    const id = interaction.customId.split(':').at(-1);
    const limit = Number(interaction.fields.getTextInputValue('maxOpenTickets'));
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      await interaction.reply({ content: '❌ O limite precisa ser um número entre 1 e 20.', flags: MessageFlags.Ephemeral });
      return true;
    }
    const list = (config.ticketTypes ?? []).map((entry) => entry.id === id ? {
      ...entry,
      name: interaction.fields.getTextInputValue('name').trim(),
      emoji: interaction.fields.getTextInputValue('emoji').trim() || null,
      description: interaction.fields.getTextInputValue('description').trim() || null,
      maxOpenTickets: limit,
    } : entry);
    updateTicketConfig(interaction.guildId, { ticketTypes: list });
    await interaction.reply({ content: '✅ Categoria atualizada.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket:forms:createModal:')) {
    const categoryId = interaction.customId.split(':').at(-1);
    const label = interaction.fields.getTextInputValue('label').trim();
    const placeholder = interaction.fields.getTextInputValue('placeholder').trim();
    const item = (config.ticketTypes ?? []).find((entry) => entry.id === categoryId);
    if (!item) {
      await interaction.reply({ content: '❌ Categoria não encontrada.', flags: MessageFlags.Ephemeral });
      return true;
    }
    if ((item.formQuestions ?? []).length >= 5) {
      await interaction.reply({ content: '❌ Este formulário já possui 5 perguntas.', flags: MessageFlags.Ephemeral });
      return true;
    }
    const question = {
      id: makeQuestionId(),
      label,
      placeholder: placeholder || null,
      type: 'short',
      required: true,
    };
    const list = (config.ticketTypes ?? []).map((entry) => entry.id === categoryId
      ? { ...entry, formQuestions: [...(entry.formQuestions ?? []), question] }
      : entry);
    updateTicketConfig(interaction.guildId, { ticketTypes: list });
    await interaction.reply({ content: `✅ Pergunta **${label}** adicionada ao formulário.`, flags: MessageFlags.Ephemeral });
    return true;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket:forms:editModal:')) {
    const parts = interaction.customId.split(':');
    const categoryId = parts[3];
    const questionId = parts[4];
    const label = interaction.fields.getTextInputValue('label').trim();
    const placeholder = interaction.fields.getTextInputValue('placeholder').trim();
    const list = (config.ticketTypes ?? []).map((entry) => entry.id === categoryId
      ? {
          ...entry,
          formQuestions: (entry.formQuestions ?? []).map((q) => q.id === questionId
            ? { ...q, label, placeholder: placeholder || null }
            : q),
        }
      : entry);
    updateTicketConfig(interaction.guildId, { ticketTypes: list });
    await interaction.reply({ content: '✅ Pergunta atualizada.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'ticket:config:limitsModal') {
    const max = Number(interaction.fields.getTextInputValue('maxOpenTickets'));
    const cooldown = Number(interaction.fields.getTextInputValue('cooldownSeconds'));
    if (!Number.isInteger(max) || max < 1 || max > 20 || !Number.isInteger(cooldown) || cooldown < 0 || cooldown > 86400) {
      await interaction.reply({ content: '❌ Valores inválidos. Limite: 1–20. Cooldown: 0–86400 segundos.', flags: MessageFlags.Ephemeral });
      return true;
    }
    updateTicketConfig(interaction.guildId, { maxOpenTickets: max, cooldownSeconds: cooldown });
    await interaction.reply({ content: `✅ Limites atualizados: **${max}** ticket(s) e **${cooldown}s** de cooldown.`, flags: MessageFlags.Ephemeral });
    return true;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'ticket:customize:textModal') {
    config = updateTicketConfig(interaction.guildId, {
      panelTitle: interaction.fields.getTextInputValue('panelTitle').trim(),
      panelDescription: interaction.fields.getTextInputValue('panelDescription').trim(),
      panelFooter: interaction.fields.getTextInputValue('panelFooter').trim() || null,
    });
    await interaction.reply({ content: '✅ Textos do painel atualizados.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'ticket:customize:visualModal') {
    const color = interaction.fields.getTextInputValue('panelColor').trim();
    const thumbnail = interaction.fields.getTextInputValue('panelThumbnail').trim();
    const image = interaction.fields.getTextInputValue('panelImage').trim();

    if (!validHexColor(color)) {
      await interaction.reply({ content: '❌ Cor inválida. Use o formato HEX, por exemplo: `#5865F2`.', flags: MessageFlags.Ephemeral });
      return true;
    }
    if (!validOptionalUrl(thumbnail) || !validOptionalUrl(image)) {
      await interaction.reply({ content: '❌ URL inválida. Use links começando com `http://` ou `https://`.', flags: MessageFlags.Ephemeral });
      return true;
    }

    updateTicketConfig(interaction.guildId, {
      panelColor: color.toUpperCase(),
      panelThumbnail: thumbnail || null,
      panelImage: image || null,
    });
    await interaction.reply({ content: '✅ Visual do painel atualizado.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'ticket:customize:buttonModal') {
    const label = interaction.fields.getTextInputValue('openButtonLabel').trim();
    const emoji = interaction.fields.getTextInputValue('openButtonEmoji').trim();
    if (!label) {
      await interaction.reply({ content: '❌ O texto do botão não pode ficar vazio.', flags: MessageFlags.Ephemeral });
      return true;
    }
    updateTicketConfig(interaction.guildId, {
      openButtonLabel: label,
      openButtonEmoji: emoji || null,
    });
    await interaction.reply({ content: '✅ Botão do painel atualizado.', flags: MessageFlags.Ephemeral });
    return true;
  }

  return false;
}

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

export function buildTicketCategoriesPanel(config) {
  const categories = config.ticketTypes ?? [];
  const embed = new EmbedBuilder()
    .setTitle('📂 Categorias de Tickets')
    .setDescription(
      categories.length
        ? `Existem **${categories.length}** categoria(s) configurada(s). Selecione uma abaixo para editar.`
        : 'Nenhuma categoria de ticket foi criada ainda.',
    )
    .setFooter({ text: 'Ticket Avançado • Fase 4' })
    .setTimestamp();

  const components = [];
  if (categories.length) {
    const select = new StringSelectMenuBuilder()
      .setCustomId('ticket:categories:select')
      .setPlaceholder('📂 Selecione uma categoria')
      .addOptions(categories.slice(0, 25).map((item) => ({
        label: item.name.slice(0, 100),
        value: item.id,
        description: (item.description || 'Sem descrição').slice(0, 100),
        emoji: item.emoji || undefined,
      })));
    components.push(new ActionRowBuilder().addComponents(select));
  }

  components.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket:categories:create')
      .setLabel('Nova Categoria')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Success)
      .setDisabled(categories.length >= 25),
    new ButtonBuilder()
      .setCustomId('ticket:categories:back')
      .setLabel('Voltar')
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary),
  ));

  return { embeds: [embed], components };
}

export function buildTicketCategoryEditor(config, categoryId) {
  const item = (config.ticketTypes ?? []).find((entry) => entry.id === categoryId);
  if (!item) return buildTicketCategoriesPanel(config);

  const embed = new EmbedBuilder()
    .setTitle(`${item.emoji || '🎫'} ${item.name}`)
    .setDescription(item.description || 'Sem descrição.')
    .addFields(
      { name: 'ID interno', value: `\`${item.id}\``, inline: true },
      { name: 'Limite por usuário', value: String(item.maxOpenTickets ?? config.maxOpenTickets ?? 1), inline: true },
      { name: 'Cargo responsável', value: item.supportRoleId ? `<@&${item.supportRoleId}>` : 'Usar cargo padrão', inline: false },
      { name: 'Categoria do Discord', value: item.discordCategoryId ? `<#${item.discordCategoryId}>` : 'Usar categoria padrão', inline: false },
    )
    .setFooter({ text: 'Ticket Avançado • Editor de categoria' })
    .setTimestamp();

  const roleSelect = new RoleSelectMenuBuilder()
    .setCustomId(`ticket:categories:role:${item.id}`)
    .setPlaceholder('👥 Selecionar cargo responsável')
    .setMinValues(1)
    .setMaxValues(1);

  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId(`ticket:categories:discordCategory:${item.id}`)
    .setPlaceholder('📁 Selecionar categoria do Discord')
    .setChannelTypes(ChannelType.GuildCategory)
    .setMinValues(1)
    .setMaxValues(1);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ticket:categories:edit:${item.id}`)
      .setLabel('Editar Dados')
      .setEmoji('✏️')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`ticket:categories:clearRole:${item.id}`)
      .setLabel('Cargo Padrão')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`ticket:categories:clearChannel:${item.id}`)
      .setLabel('Categoria Padrão')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`ticket:forms:open:${item.id}`)
      .setLabel('Formulário')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`ticket:categories:delete:${item.id}`)
      .setLabel('Excluir')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger),
  );

  const back = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket:categories:list')
      .setLabel('Voltar')
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary),
  );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(roleSelect),
      new ActionRowBuilder().addComponents(channelSelect),
      buttons,
      back,
    ],
  };
}

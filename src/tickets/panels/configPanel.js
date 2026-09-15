import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder,
  ChannelType, EmbedBuilder, RoleSelectMenuBuilder,
} from 'discord.js';

const ch = (id) => id ? `<#${id}>` : 'Não configurado';
const role = (id) => id ? `<@&${id}>` : 'Não configurado';

export function buildTicketConfigPanel(config) {
  const embed = new EmbedBuilder()
    .setTitle('⚙️ Tickets — Configuração Geral')
    .setDescription('Configure canais e cargos pelos menus. Use **Mais opções** para limites, cooldown e cargo administrador.')
    .addFields(
      { name: '📢 Canal do painel', value: ch(config.panelChannelId), inline: true },
      { name: '📁 Categoria dos tickets', value: ch(config.ticketCategoryId), inline: true },
      { name: '📝 Canal de logs', value: ch(config.logChannelId), inline: true },
      { name: '👥 Cargo da equipe', value: role(config.supportRoleId), inline: true },
      { name: '🛡️ Cargo administrador', value: role(config.adminRoleId), inline: true },
      { name: '🎟️ Limite', value: String(config.maxOpenTickets), inline: true },
      { name: '⏳ Cooldown', value: `${config.cooldownSeconds}s`, inline: true },
    )
    .setFooter({ text: 'Ticket Avançado • Fase 3' }).setTimestamp();

  return { embeds: [embed], components: [
    new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('ticket:config:panelChannel').setPlaceholder('📢 Canal do painel').setChannelTypes(ChannelType.GuildText).setMinValues(1).setMaxValues(1)),
    new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('ticket:config:ticketCategory').setPlaceholder('📁 Categoria dos tickets').setChannelTypes(ChannelType.GuildCategory).setMinValues(1).setMaxValues(1)),
    new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('ticket:config:logChannel').setPlaceholder('📝 Canal de logs').setChannelTypes(ChannelType.GuildText).setMinValues(1).setMaxValues(1)),
    new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setCustomId('ticket:config:supportRole').setPlaceholder('👥 Cargo da equipe').setMinValues(1).setMaxValues(1)),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket:config:more').setLabel('Mais opções').setEmoji('🧰').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket:config:back').setLabel('Voltar').setEmoji('↩️').setStyle(ButtonStyle.Secondary),
    ),
  ]};
}

export function buildTicketMoreConfigPanel(config) {
  const embed = new EmbedBuilder().setTitle('🧰 Tickets — Mais opções')
    .addFields(
      { name: '🛡️ Cargo administrador', value: role(config.adminRoleId) },
      { name: '🎟️ Máximo de tickets por usuário', value: String(config.maxOpenTickets), inline: true },
      { name: '⏳ Cooldown', value: `${config.cooldownSeconds}s`, inline: true },
    ).setFooter({ text: 'Ticket Avançado • Fase 3' }).setTimestamp();
  return { embeds: [embed], components: [
    new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setCustomId('ticket:config:adminRole').setPlaceholder('🛡️ Cargo administrador').setMinValues(1).setMaxValues(1)),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket:config:limits').setLabel('Limite e Cooldown').setEmoji('⏱️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket:config:reset').setLabel('Limpar configuração').setEmoji('🧹').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('ticket:config:main').setLabel('Voltar').setEmoji('↩️').setStyle(ButtonStyle.Secondary),
    ),
  ]};
}

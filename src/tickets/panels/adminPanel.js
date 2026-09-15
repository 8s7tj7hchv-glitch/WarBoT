import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { ticketConfigStatus } from '../config/ticketConfig.js';

const LABELS = {
  panelChannelId: 'Canal do painel',
  ticketCategoryId: 'Categoria dos tickets',
  logChannelId: 'Canal de logs',
  supportRoleId: 'Cargo da equipe',
};

export function buildTicketAdminPanel(config) {
  const status = ticketConfigStatus(config);
  const missing = status.missing.length
    ? status.missing.map((key) => `• ${LABELS[key] ?? key}`).join('\n')
    : 'Nenhuma configuração obrigatória pendente.';

  const embed = new EmbedBuilder()
    .setTitle('🎫 Sistema de Tickets — Administração')
    .setDescription('Gerencie o sistema de tickets diretamente pelo Discord.')
    .addFields(
      { name: 'Sistema', value: config.enabled ? '🟢 Ativado' : '🔴 Desativado', inline: true },
      { name: 'Configuração', value: status.ready ? '✅ Pronta' : '⚠️ Incompleta', inline: true },
      { name: 'Pendências', value: missing },
    )
    .setFooter({ text: 'Ticket Avançado • Fase 4' })
    .setTimestamp();

  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket:admin:toggle')
      .setLabel(config.enabled ? 'Desativar' : 'Ativar')
      .setEmoji(config.enabled ? '🔴' : '🟢')
      .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('ticket:admin:status')
      .setLabel('Status')
      .setEmoji('📋')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('ticket:admin:configure')
      .setLabel('Configurar')
      .setEmoji('⚙️')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('ticket:admin:customize')
      .setLabel('Personalizar')
      .setEmoji('🎨')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('ticket:admin:categories')
      .setLabel('Categorias')
      .setEmoji('📂')
      .setStyle(ButtonStyle.Primary),
  );

  return { embeds: [embed], components: [controls] };
}

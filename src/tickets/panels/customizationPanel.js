import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

const none = (value) => value || 'Não configurado';

export function buildTicketCustomizationPanel(config) {
  const embed = new EmbedBuilder()
    .setTitle('🎨 Tickets — Personalização do Painel')
    .setDescription('Personalize o painel público. As alterações ficam salvas por servidor.')
    .addFields(
      { name: '📝 Título', value: none(config.panelTitle) },
      { name: '💬 Descrição', value: none(config.panelDescription) },
      { name: '🎨 Cor', value: `\`${config.panelColor || '#5865F2'}\``, inline: true },
      { name: '🔘 Botão', value: `${config.openButtonEmoji || ''} ${config.openButtonLabel || 'Abrir Ticket'}`.trim(), inline: true },
      { name: '🧩 Estilo', value: config.openButtonStyle || 'Primary', inline: true },
      { name: '🖼️ Thumbnail', value: config.panelThumbnail ? 'Configurada' : 'Não configurada', inline: true },
      { name: '🌄 Imagem', value: config.panelImage ? 'Configurada' : 'Não configurada', inline: true },
      { name: '🔻 Footer', value: none(config.panelFooter), inline: true },
    )
    .setFooter({ text: 'Ticket Avançado • Fase 3' })
    .setTimestamp();

  const styleSelect = new StringSelectMenuBuilder()
    .setCustomId('ticket:customize:buttonStyle')
    .setPlaceholder('🧩 Estilo do botão de abrir ticket')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Azul / Primary').setValue('Primary').setEmoji('🔵').setDefault(config.openButtonStyle === 'Primary'),
      new StringSelectMenuOptionBuilder().setLabel('Cinza / Secondary').setValue('Secondary').setEmoji('⚪').setDefault(config.openButtonStyle === 'Secondary'),
      new StringSelectMenuOptionBuilder().setLabel('Verde / Success').setValue('Success').setEmoji('🟢').setDefault(config.openButtonStyle === 'Success'),
      new StringSelectMenuOptionBuilder().setLabel('Vermelho / Danger').setValue('Danger').setEmoji('🔴').setDefault(config.openButtonStyle === 'Danger'),
    );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket:customize:text').setLabel('Textos').setEmoji('✏️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket:customize:visual').setLabel('Visual').setEmoji('🖼️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket:customize:button').setLabel('Botão').setEmoji('🔘').setStyle(ButtonStyle.Primary),
      ),
      new ActionRowBuilder().addComponents(styleSelect),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket:customize:preview').setLabel('Pré-visualizar').setEmoji('👁️').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('ticket:customize:reset').setLabel('Restaurar padrão').setEmoji('♻️').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('ticket:customize:back').setLabel('Voltar').setEmoji('↩️').setStyle(ButtonStyle.Secondary),
      ),
    ],
  };
}

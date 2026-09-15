import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';

const STYLE_MAP = {
  Primary: ButtonStyle.Primary,
  Secondary: ButtonStyle.Secondary,
  Success: ButtonStyle.Success,
  Danger: ButtonStyle.Danger,
};

function validHttpUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function buildPublicTicketPanel(config, { preview = false } = {}) {
  const embed = new EmbedBuilder()
    .setTitle(config.panelTitle || '🎫 Central de Atendimento')
    .setDescription(config.panelDescription || 'Clique no botão abaixo para abrir um ticket.')
    .setColor(config.panelColor || '#5865F2');

  if (config.panelFooter) embed.setFooter({ text: config.panelFooter });
  if (validHttpUrl(config.panelThumbnail)) embed.setThumbnail(config.panelThumbnail);
  if (validHttpUrl(config.panelImage)) embed.setImage(config.panelImage);

  if (preview) {
    embed.addFields({
      name: '👁️ Pré-visualização',
      value: 'Esta é a aparência atual do painel público.',
    });
  }

  const button = new ButtonBuilder()
    .setCustomId('ticket:public:open')
    .setLabel((config.openButtonLabel || 'Abrir Ticket').slice(0, 80))
    .setStyle(STYLE_MAP[config.openButtonStyle] ?? ButtonStyle.Primary);

  if (config.openButtonEmoji) {
    try { button.setEmoji(config.openButtonEmoji); } catch { /* emoji inválido é ignorado */ }
  }

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(button)],
  };
}

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function buildPublicTicketPanel(cfg, categories = []) {
  const p = cfg.panel || {};
  const embed = new EmbedBuilder()
    .setTitle(p.title || '🎫 Central de Atendimento')
    .setDescription(p.description || 'Selecione abaixo o tipo de atendimento que deseja abrir.')
    .setColor(p.color || '#5865F2');
  if (p.footer) embed.setFooter({ text: p.footer });
  if (p.thumbnail) embed.setThumbnail(p.thumbnail);
  if (p.image) embed.setImage(p.image);

  const rows = [];
  for (let i = 0; i < Math.min(categories.length, 25); i += 5) {
    const row = new ActionRowBuilder();
    for (const c of categories.slice(i, i + 5)) {
      const b = new ButtonBuilder()
        .setCustomId(`ticket_open:${c.key}`)
        .setLabel(String(c.name || 'Ticket').slice(0,80))
        .setStyle(ButtonStyle.Primary);
      if (c.emoji) b.setEmoji(c.emoji);
      row.addComponents(b);
    }
    rows.push(row);
  }
  return { embeds: [embed], components: rows };
}

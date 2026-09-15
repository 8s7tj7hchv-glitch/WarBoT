import { AttachmentBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { getTicketByChannel, appendTicketHistory } from '../database/ticketStore.js';

function esc(v='') {
  return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

async function fetchAllMessages(channel) {
  const all = [];
  let before;
  while (true) {
    const batch = await channel.messages.fetch({ limit: 100, ...(before ? { before } : {}) });
    if (!batch.size) break;
    all.push(...batch.values());
    before = batch.last().id;
    if (batch.size < 100) break;
  }
  return all.sort((a,b) => a.createdTimestamp - b.createdTimestamp);
}

export async function generateTranscript(channel, ticket) {
  const messages = await fetchAllMessages(channel);

  const body = messages.map(m => {
    const attachments = [...m.attachments.values()].map(a =>
      `<li><a href="${esc(a.url)}">${esc(a.name || 'anexo')}</a></li>`
    ).join('');

    const embeds = m.embeds.length
      ? `<div class="embeds">${m.embeds.map(e => esc(e.title || e.description || '[Embed]')).join('<br>')}</div>`
      : '';

    return `<article class="msg">
      <div class="meta"><b>${esc(m.author.tag)}</b> · ${new Date(m.createdTimestamp).toLocaleString('pt-BR')}</div>
      <div class="content">${esc(m.content || '').replace(/\n/g,'<br>')}</div>
      ${embeds}
      ${attachments ? `<ul>${attachments}</ul>` : ''}
    </article>`;
  }).join('\n');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Transcript Ticket #${esc(ticket.number)}</title>
<style>
body{font-family:Arial,sans-serif;background:#1e1f22;color:#dbdee1;margin:0;padding:24px}
main{max-width:980px;margin:auto}.head,.msg{background:#2b2d31;padding:16px;border-radius:10px;margin-bottom:12px}
.meta{color:#b5bac1;font-size:13px;margin-bottom:8px}.content{line-height:1.45}
a{color:#00a8fc}.embeds{border-left:4px solid #5865f2;padding:8px;margin-top:8px;background:#232428}
</style>
</head>
<body><main>
<section class="head">
<h1>🎫 Ticket #${esc(ticket.number)}</h1>
<p><b>Categoria:</b> ${esc(ticket.categoryName || ticket.categoryKey)}</p>
<p><b>Dono:</b> ${esc(ticket.ownerId)}</p>
<p><b>Atendente:</b> ${esc(ticket.claimedBy || 'Não definido')}</p>
<p><b>Status:</b> ${esc(ticket.status)}</p>
<p><b>Criado:</b> ${esc(ticket.createdAt)}</p>
<p><b>Fechado:</b> ${esc(ticket.closedAt || '—')}</p>
<p><b>Motivo:</b> ${esc(ticket.closeReason || '—')}</p>
</section>
${body}
</main></body></html>`;

  return Buffer.from(html, 'utf8');
}

export async function sendTranscript(interaction, cfg = {}) {
  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', flags: MessageFlags.Ephemeral });

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const buffer = await generateTranscript(interaction.channel, ticket);
  const filename = `ticket-${ticket.number}-transcript.html`;

  appendTicketHistory(interaction.guildId, interaction.channelId, {
    action: 'transcript_generated', userId: interaction.user.id
  });

  const logChannelId = cfg.logChannelId || cfg.logsChannelId;
  if (logChannelId) {
    const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
    if (logChannel?.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle(`📄 Transcript — Ticket #${ticket.number}`)
        .addFields(
          { name: 'Usuário', value: `<@${ticket.ownerId}>`, inline: true },
          { name: 'Categoria', value: ticket.categoryName || ticket.categoryKey || '—', inline: true },
          { name: 'Motivo', value: ticket.closeReason || '—' }
        ).setTimestamp();
      await logChannel.send({ embeds: [embed], files: [new AttachmentBuilder(buffer, { name: filename })] }).catch(() => null);
    }
  }

  const owner = await interaction.client.users.fetch(ticket.ownerId).catch(() => null);
  if (owner && cfg.transcriptDM !== false) {
    await owner.send({
      content: `📄 Transcript do seu ticket **#${ticket.number}** em **${interaction.guild.name}**.`,
      files: [new AttachmentBuilder(buffer, { name: filename })]
    }).catch(() => null);
  }

  await interaction.editReply({ content: '✅ Transcript gerado e enviado conforme a configuração.' });
  return { buffer, filename };
}

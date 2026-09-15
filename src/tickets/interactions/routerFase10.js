import { PermissionFlagsBits, MessageFlags } from 'discord.js';
import { sendTranscript } from '../services/transcriptService.js';
import { getTicketByChannel } from '../database/ticketStore.js';

// Ajuste este import somente se o store das fases anteriores possuir outro nome.
import { getTicketConfig } from '../config/ticketConfig.js';

export async function routeTicketFase10(interaction) {
  if (!interaction.isButton() || interaction.customId !== 'ticket_transcript') return false;

  const ticket = getTicketByChannel(interaction.guildId, interaction.channelId);
  if (!ticket) {
    await interaction.reply({ content: '❌ Ticket não encontrado.', flags: MessageFlags.Ephemeral });
    return true;
  }

  const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
  const isStaff = !ticket.staffRoleId || interaction.member?.roles?.cache?.has(ticket.staffRoleId);
  if (!isAdmin && !isStaff) {
    await interaction.reply({ content: '❌ Apenas a equipe pode gerar o transcript.', flags: MessageFlags.Ephemeral });
    return true;
  }

  const cfg = getTicketConfig(interaction.guildId) || {};
  await sendTranscript(interaction, cfg);
  return true;
}

import { PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } from 'discord.js';
import { setBlacklist, isBlacklisted } from '../database/securityStore.js';

function admin(interaction) {
  return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
}

export function blacklistModal() {
  return new ModalBuilder()
    .setCustomId('ticket_blacklist_modal')
    .setTitle('Blacklist de Tickets')
    .addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('userId')
        .setLabel('ID do usuário')
        .setPlaceholder('123456789012345678')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
    ));
}

export async function toggleBlacklist(interaction) {
  if (!admin(interaction)) return interaction.reply({ content: '❌ Apenas administradores.', flags: MessageFlags.Ephemeral });
  const userId = interaction.fields.getTextInputValue('userId').trim();
  if (!/^\d{17,20}$/.test(userId)) return interaction.reply({ content: '❌ ID inválido.', flags: MessageFlags.Ephemeral });

  const enabled = !isBlacklisted(interaction.guildId, userId);
  setBlacklist(interaction.guildId, userId, enabled);
  return interaction.reply({
    content: enabled ? `🚫 <@${userId}> entrou na blacklist de tickets.` : `✅ <@${userId}> foi removido da blacklist.`,
    flags: MessageFlags.Ephemeral
  });
}

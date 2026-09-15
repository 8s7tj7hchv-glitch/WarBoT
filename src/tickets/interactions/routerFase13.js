import { MessageFlags } from 'discord.js';
import { blacklistModal, toggleBlacklist } from './securityAdmin.js';
import { checkInteractionBurst } from '../services/securityService.js';

export async function routeTicketFase13(interaction) {
  if (interaction.guildId && interaction.user && interaction.customId?.startsWith('ticket_')) {
    const allowed = checkInteractionBurst(interaction.guildId, interaction.user.id, 12, 10_000);
    if (!allowed) {
      if (interaction.isRepliable()) {
        await interaction.reply({ content: '🛡️ Muitas ações em sequência. Aguarde alguns segundos.', flags: MessageFlags.Ephemeral }).catch(() => null);
      }
      return true;
    }
  }

  if (interaction.isButton() && interaction.customId === 'ticket_blacklist') {
    await interaction.showModal(blacklistModal());
    return true;
  }
  if (interaction.isModalSubmit() && interaction.customId === 'ticket_blacklist_modal') {
    await toggleBlacklist(interaction);
    return true;
  }
  return false;
}

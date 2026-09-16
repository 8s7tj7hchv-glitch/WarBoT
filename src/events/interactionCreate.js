import { Events, MessageFlags } from 'discord.js';

import { handleUiInteraction } from '../ui/UiRouter.js';
import { handleUnifiedUiInteraction } from '../ui/UnifiedUiRouter.js';
import { handleOwnerUiInteraction } from '../ui/OwnerUiRouter.js';

// ⚙️ Controle Central de Sistemas
import {
  handleSystemControlInteraction
} from '../systems/systemControlPanel.js';

// 🎁 Sorteios — Fases 1–10
import {
  handleGiveawaySystem
} from '../giveaways/router/giveawayRouter.js';

// 🎫 Tickets — Fases 1–5
import {
  handleTicketInteraction
} from '../tickets/interactionHandler.js';

// 🎫 Tickets — Fases 6–15
import {
  handleTicketSystem
} from '../tickets/router/ticketRouter.js';

export default {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    try {
      // ==========================================
      // 🔘 BOTÕES / MENUS / MODAIS
      // ==========================================
      if (
        interaction.isButton() ||
        interaction.isStringSelectMenu() ||
        interaction.isChannelSelectMenu?.() ||
        interaction.isRoleSelectMenu?.() ||
        interaction.isUserSelectMenu?.() ||
        interaction.isModalSubmit()
      ) {
        console.log(
          '🔎 INTERAÇÃO:',
          interaction.customId,
          '| tipo:',
          interaction.type
        );

        // ========================================
        // ⚙️ CONTROLE CENTRAL DE SISTEMAS
        // ========================================
        const centralHandled =
          await handleSystemControlInteraction(interaction);

        if (centralHandled !== false) {
          return;
        }

        // ========================================
        // 🎁 SORTEIOS — FASES 1–10
        // ========================================
        const giveawayHandled =
          await handleGiveawaySystem(interaction);

        if (giveawayHandled === true) {
          return;
        }

        // ========================================
        // 🎫 TICKETS — FASES 1–5
        // ========================================
        const ticketBaseHandled =
          await handleTicketInteraction(interaction);

        if (ticketBaseHandled === true) {
          return;
        }

        // ========================================
        // 🎫 TICKETS — FASES 6–15
        // ========================================
        const ticketHandled =
          await handleTicketSystem(interaction);

        if (ticketHandled === true) {
          return;
        }

        // ========================================
        // 👑 OWNER
        // ========================================
        const ownerHandled =
          await handleOwnerUiInteraction(interaction);

        if (ownerHandled !== false) {
          return;
        }

        // ========================================
        // 🌐 UI UNIFICADA
        // ========================================
        const unifiedHandled =
          await handleUnifiedUiInteraction(interaction);

        if (unifiedHandled !== false) {
          return;
        }

        // ========================================
        // 🎮 UI GERAL
        // ========================================
        const handled =
          await handleUiInteraction(interaction);

        if (handled !== false) {
          return;
        }

        return;
      }

      // ==========================================
      // ⌨️ COMANDOS SLASH
      // ==========================================
      if (!interaction.isChatInputCommand()) {
        return;
      }

      const command =
        client.commands.get(interaction.commandName);

      if (!command) {
        console.warn(
          `⚠️ Comando não encontrado: /${interaction.commandName}`
        );
        return;
      }

      await command.execute(interaction, client);

    } catch (error) {
      console.error(
        '❌ Erro de interação:',
        error
      );

      const payload = {
        content:
          '❌ Ocorreu um erro ao executar esta interação.',
        flags: MessageFlags.Ephemeral
      };

      if (!interaction.isRepliable()) {
        return;
      }

      if (interaction.replied || interaction.deferred) {
        await interaction
          .followUp(payload)
          .catch(() => {});
      } else {
        await interaction
          .reply(payload)
          .catch(() => {});
      }
    }
  }
};
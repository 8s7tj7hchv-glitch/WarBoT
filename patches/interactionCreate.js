import { Events } from 'discord.js';
import { handleUiInteraction } from '../ui/UiRouter.js';
import { handleUnifiedUiInteraction } from '../ui/UnifiedUiRouter.js';
import { handleOwnerUiInteraction } from '../ui/OwnerUiRouter.js';

export default {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    try {
      if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isChannelSelectMenu?.() || interaction.isModalSubmit()) {
        const ownerHandled = await handleOwnerUiInteraction(interaction);
        if (ownerHandled !== false) return;

        const unifiedHandled = await handleUnifiedUiInteraction(interaction);
        if (unifiedHandled !== false) return;

        const handled = await handleUiInteraction(interaction);
        if (handled !== false) return;
      }

      if (!interaction.isChatInputCommand()) return;
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    } catch (error) {
      console.error('❌ Erro de interação:', error);
      const payload = { content: '❌ Ocorreu um erro ao executar esta interação.', ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
      else await interaction.reply(payload).catch(() => {});
    }
  }
};

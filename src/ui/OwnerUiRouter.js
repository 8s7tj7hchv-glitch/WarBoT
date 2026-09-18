import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import { assertBotOwner } from '../owner/OwnerAccess.js';
import { VipManager } from '../owner/VipManager.js';
import { ExclusiveForcesManager } from '../owner/ExclusiveForcesManager.js';
import { renderOwnerPanel, renderOwnerForces, renderProPlayers } from './OwnerPanel.js';
import { GlobalRewardManager } from '../global_profile/GlobalRewardManager.js';

const vip = new VipManager();
const forces = new ExclusiveForcesManager();
const globalRewards = new GlobalRewardManager();
const row = component => new ActionRowBuilder().addComponents(component);

function input(id, label, placeholder, required = true) {
  return new TextInputBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(TextInputStyle.Short)
    .setRequired(required)
    .setPlaceholder(placeholder);
}

function proModal(kind) {
  const modal = new ModalBuilder()
    .setCustomId(`owner:modal:${kind}`)
    .setTitle(kind === 'grant' ? 'Presentear Pro Player' : 'Remover Pro Player');

  const items = [row(input('user_id', 'ID do jogador', 'ID do Discord'))];
  if (kind === 'grant') items.push(row(input('days', 'Duração em dias', 'Vazio = permanente', false)));
  return modal.addComponents(...items);
}

export async function handleOwnerUiInteraction(interaction) {
  const id = interaction.customId ?? '';
  if (!id.startsWith('owner:')) return false;

  try {
    assertBotOwner(interaction.user.id);

    if (interaction.isButton()) {
      if (id === 'owner:refresh') {
        await interaction.update(renderOwnerPanel(interaction.user));
        return true;
      }
      if (id === 'owner:forces') {
        await interaction.reply({ embeds: [renderOwnerForces(interaction.user.id)], ephemeral: true });
        return true;
      }
      if (id === 'owner:pro:list') {
        await interaction.reply({ embeds: [renderProPlayers()], ephemeral: true });
        return true;
      }
      if (id === 'owner:pro:grant') {
        await interaction.showModal(proModal('grant'));
        return true;
      }
      if (id === 'owner:pro:revoke') {
        await interaction.showModal(proModal('revoke'));
        return true;
      }
      if (id === 'owner:reward:send') {
        const modal = new ModalBuilder().setCustomId('owner:modal:reward').setTitle('Enviar recompensa por Game ID').addComponents(
          row(input('game_id', 'Game ID do jogador', 'WB-7K4M-92PX')),
          row(input('title', 'Nome da recompensa', 'Prêmio do sorteio')),
          row(input('description', 'Descrição', 'Detalhes da recompensa', false))
        );
        await interaction.showModal(modal); return true;
      }
    }

    if (interaction.isStringSelectMenu() && id === 'owner:force:create') {
      const force = forces.create({ actorId: interaction.user.id, templateId: interaction.values[0] });
      await interaction.reply({ content: `✅ Força exclusiva **${force.name}** criada.`, ephemeral: true });
      return true;
    }

    if (interaction.isModalSubmit() && id === 'owner:modal:grant') {
      const entry = vip.grant({
        actorId: interaction.user.id,
        userId: interaction.fields.getTextInputValue('user_id'),
        days: interaction.fields.getTextInputValue('days').trim() || null
      });
      await interaction.reply({ content: `✅ <@${entry.user_id}> recebeu **Pro Player**${entry.expires_at ? ` até <t:${Math.floor(new Date(entry.expires_at).getTime() / 1000)}:F>` : ' permanentemente'}.`, ephemeral: true });
      return true;
    }


    if (interaction.isModalSubmit() && id === 'owner:modal:reward') {
      const result = globalRewards.sendByGameId({ actorId: interaction.user.id, gameId: interaction.fields.getTextInputValue('game_id'), title: interaction.fields.getTextInputValue('title'), description: interaction.fields.getTextInputValue('description'), source: 'owner' });
      await interaction.reply({ content: `✅ Recompensa enviada para **${result.profile.game_id}** (<@${result.profile.discord_user_id}>).\n🏠 Origem: **${result.profile.origin_guild_name || result.profile.origin_guild_id || 'não definida'}**\n📬 Recompensa: **${result.reward.title}**`, ephemeral: true }); return true;
    }

    if (interaction.isModalSubmit() && id === 'owner:modal:revoke') {
      const uid = interaction.fields.getTextInputValue('user_id').replace(/\D/g, '');
      const removed = vip.revoke({ actorId: interaction.user.id, userId: uid });
      await interaction.reply({ content: removed ? `✅ Pro Player removido de <@${uid}>.` : 'ℹ️ Esse jogador não possuía Pro Player.', ephemeral: true });
      return true;
    }
  } catch (error) {
    const payload = { content: `❌ ${error.message}`, ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
    else await interaction.reply(payload).catch(() => {});
    return true;
  }

  return false;
}

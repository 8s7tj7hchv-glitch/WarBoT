import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { renderGlobalProfile, renderInbox } from './ProfilePanel.js';
import { GlobalRewardManager } from '../global_profile/GlobalRewardManager.js';
import { ProfileManager } from '../players/ProfileManager.js';
import { VipManager } from '../owner/VipManager.js';

const rewards = new GlobalRewardManager();
const players = new ProfileManager();
const vip = new VipManager();

function infoEmbed(title, description) { return new EmbedBuilder().setTitle(title).setDescription(description); }

export async function handleProfileUiInteraction(interaction) {
  const id = interaction.customId ?? '';
  if (!id.startsWith('profile:')) return false;

  if (interaction.isButton() && id === 'profile:refresh') {
    await interaction.update(renderGlobalProfile(interaction)); return true;
  }
  if (interaction.isButton() && id === 'profile:stats') {
    const p = players.get(interaction.user.id);
    await interaction.reply({ embeds: [infoEmbed('📊 Estatísticas do Jogador', `Nível: **${p?.level ?? 1}**\nXP: **${p?.xp ?? 0}**\nProfissão: **${p?.profession ?? 'Não definida'}**\nPaís: **${p?.country ?? 'Não definido'}**`)], ephemeral: true }); return true;
  }
  if (interaction.isButton() && id === 'profile:war') {
    await interaction.reply({ embeds: [infoEmbed('🌍 Guerra Mundial', 'Seu perfil global está preparado para reunir missões, batalhas, vitórias, derrotas e conquistas da Guerra Mundial.')], ephemeral: true }); return true;
  }
  if (interaction.isButton() && id === 'profile:economy') {
    const p = players.get(interaction.user.id);
    await interaction.reply({ embeds: [infoEmbed('💰 Economia', `Patrimônio e estatísticas econômicas utilizam os dados do perfil do jogador.\nSaldo disponível: **${p?.wallet ?? p?.balance ?? 0}**`)], ephemeral: true }); return true;
  }
  if (interaction.isButton() && id === 'profile:pro') {
    const active = vip.isActive?.(interaction.user.id) ?? false;
    await interaction.reply({ embeds: [infoEmbed('⭐ Pro Player', active ? 'Seu status **Pro Player está ativo**. Recompensas, Pro Points e benefícios continuam separados das vantagens exclusivas do Owner.' : 'Você ainda não possui Pro Player ativo.')], ephemeral: true }); return true;
  }
  if (interaction.isButton() && id === 'profile:inbox') {
    const list = rewards.inbox(interaction.user.id);
    const rows = list.slice(0, 5).map(r => new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`profile:claim:${r.id}`).setLabel(`Resgatar ${r.id}`).setEmoji('🎁').setStyle(ButtonStyle.Success)));
    await interaction.reply({ embeds: [renderInbox(interaction.user.id)], components: rows, ephemeral: true }); return true;
  }
  if (interaction.isButton() && id.startsWith('profile:claim:')) {
    const r = rewards.claim(interaction.user.id, id.slice('profile:claim:'.length));
    await interaction.update({ content: `✅ Recompensa **${r.title}** marcada como resgatada.`, embeds: [], components: [] }); return true;
  }
  return false;
}

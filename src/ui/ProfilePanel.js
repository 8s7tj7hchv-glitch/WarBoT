import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { GlobalProfileManager } from '../global_profile/GlobalProfileManager.js';
import { GlobalRewardManager } from '../global_profile/GlobalRewardManager.js';
import { ProfileManager } from '../players/ProfileManager.js';
import { VipManager } from '../owner/VipManager.js';

const globalProfiles = new GlobalProfileManager();
const rewards = new GlobalRewardManager();
const players = new ProfileManager();
const vip = new VipManager();
const HERE = path.dirname(fileURLToPath(import.meta.url));
const VOXEL_IMAGE = path.resolve(HERE, '../../assets/profile/perfil-voxel-base.png');

function proText(userId) {
  if (!(vip.isActive?.(userId) ?? false)) return 'Não ativo';
  const data = vip.get?.(userId) ?? vip.getPlayer?.(userId) ?? null;
  if (!data?.expiresAt && !data?.expires_at) return 'Ativo';
  const end = new Date(data.expiresAt ?? data.expires_at).getTime();
  const days = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  return `Ativo • ${days} dia(s) restantes`;
}

export function renderGlobalProfile(interaction) {
  const gp = globalProfiles.touch({
    userId: interaction.user.id,
    username: interaction.user.username,
    guildId: interaction.guildId,
    guildName: interaction.guild?.name ?? ''
  });
  const p = players.get(interaction.user.id);
  const pending = rewards.inbox(interaction.user.id).length;
  const attachment = new AttachmentBuilder(VOXEL_IMAGE, { name: 'perfil-voxel-base.png' });

  const e = new EmbedBuilder()
    .setTitle('🌐 PERFIL DO JOGADOR')
    .setDescription(`🪪 **Game ID:** \`${gp.game_id}\`\n👤 **Jogador:** <@${gp.discord_user_id}>\n🟢 Perfil Global WarBoT`)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .setImage('attachment://perfil-voxel-base.png')
    .addFields(
      { name: '🏠 Servidor de origem', value: gp.origin_guild_name || gp.origin_guild_id || 'Não definido', inline: true },
      { name: '🌐 Servidores', value: String(gp.guilds.length), inline: true },
      { name: '📬 Caixa Global', value: `${pending} pendente(s)`, inline: true },
      { name: '⭐ Pro Player', value: proText(interaction.user.id), inline: true },
      { name: '📊 Progressão', value: `Nível **${p?.level ?? 1}**\nXP **${p?.xp ?? 0}**`, inline: true },
      { name: '💼 Profissão / 🏳️ País', value: `${p?.profession ?? 'Não definida'}\n${p?.country ?? 'Não definido'}`, inline: true }
    )
    .setFooter({ text: 'WarBoT • Game ID único • Perfil Global • Vários Servidores' });

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('profile:stats').setLabel('Estatísticas').setEmoji('📊').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('profile:war').setLabel('Guerra Mundial').setEmoji('🌍').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('profile:economy').setLabel('Economia').setEmoji('💰').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('profile:pro').setLabel('Pro').setEmoji('⭐').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('profile:inbox').setLabel('Recompensas').setEmoji('📬').setStyle(ButtonStyle.Success)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('profile:refresh').setLabel('Atualizar perfil').setEmoji('🔄').setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [e], components: [row1, row2], files: [attachment] };
}

export function renderInbox(userId) {
  const list = rewards.inbox(userId);
  const text = list.length ? list.slice(0, 20).map(r => `🎁 **${r.title}**\nID: \`${r.id}\`\n${r.description || 'Sem descrição.'}`).join('\n\n') : 'Nenhuma recompensa pendente.';
  return new EmbedBuilder().setTitle('📬 Caixa Global de Recompensas').setDescription(text);
}

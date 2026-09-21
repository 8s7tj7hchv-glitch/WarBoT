import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { GlobalProfileManager } from '../global_profile/GlobalProfileManager.js';
import { GlobalRewardManager } from '../global_profile/GlobalRewardManager.js';
import { ProfileManager } from '../players/ProfileManager.js';
import { StatisticsManager } from '../players/StatisticsManager.js';
import { WalletManager } from '../economy/WalletManager.js';
import { VipManager } from '../owner/VipManager.js';
import { ProPlayerManager } from '../pro/ProPlayerManager.js';
import { BonusManager } from '../bonuses/BonusManager.js';

const globalProfiles = new GlobalProfileManager();
const rewards = new GlobalRewardManager();
const players = new ProfileManager();
const statistics = new StatisticsManager();
const wallet = new WalletManager();
const vip = new VipManager();
const pro = new ProPlayerManager();
const bonuses = new BonusManager();

const nf = new Intl.NumberFormat('pt-BR');
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const RARITY = { common:'⚪', uncommon:'🟢', rare:'🔵', epic:'🟣', legendary:'🟡', mythic:'🔴' };

function proText(userId) {
  const data = vip.get(userId);
  if (!data) return 'Não ativo';
  if (!data.expires_at) return 'Ativo • Permanente';
  const days = Math.max(0, Math.ceil((new Date(data.expires_at).getTime() - Date.now()) / 86400000));
  return `Ativo • ${days} dia(s) restantes`;
}

function progressText(p) {
  const level = Number(p?.level ?? 1);
  const xp = Number(p?.xp ?? 0);
  // Compatível com a progressão atual: se não houver meta persistida, mostra somente o XP real.
  const target = Number(p?.xp_to_next_level ?? p?.next_level_xp ?? 0);
  return target > 0 ? `Nível **${level}**\nXP **${nf.format(xp)} / ${nf.format(target)}**` : `Nível **${level}**\nXP **${nf.format(xp)}**`;
}

function bonusText(userId) {
  const equipped = bonuses.equipped(userId).slice(0, 3);
  if (!equipped.length) return 'Nenhum bônus equipado • 0/3 slots';
  return equipped.map((b, i) => `${i + 1}. ${RARITY[b.rarity] ?? '🎁'} ${b.definition?.name ?? b.bonus_id}`).join('\n');
}

export function renderGlobalProfile(interaction) {
  const userId = interaction.user.id;
  const gp = globalProfiles.touch({ userId, username: interaction.user.username, guildId: interaction.guildId, guildName: interaction.guild?.name ?? '' });
  const p = players.getOrCreate(userId, interaction.user.username);
  const s = statistics.get(userId);
  const pp = pro.profile(userId);
  const pending = rewards.inbox(userId).length;
  const balance = wallet.getBalance(userId);

  const e = new EmbedBuilder()
    .setTitle('🌐 PERFIL DO JOGADOR')
    .setDescription(`🪪 **Game ID:** \`${gp.game_id}\`\n👤 **Jogador:** <@${userId}>\n🏠 **Servidor de origem:** ${gp.origin_guild_name || gp.origin_guild_id || 'Não definido'}\n🌐 **Servidores vinculados:** ${gp.guilds.length}`)
    .addFields(
      { name: '⭐ PRO PLAYER', value: proText(userId), inline: true },
      { name: '📊 PROGRESSÃO', value: progressText(p), inline: true },
      { name: '🎟️ PRO', value: `Pro Points **${nf.format(pp.pro_points ?? 0)}**\n🔥 Sequência **${nf.format(pp.streak ?? 0)} dia(s)**`, inline: true },
      { name: '🏳️ PAÍS', value: String(p?.country ?? 'Não definido'), inline: true },
      { name: '💼 PROFISSÃO', value: String(p?.profession ?? 'Não definida'), inline: true },
      { name: '💰 ECONOMIA', value: `Carteira **${money.format(balance)}**`, inline: true },
      { name: '📈 ATIVIDADE', value: `Recursos coletados **${nf.format(s.resources_collected ?? 0)}**\nItens produzidos **${nf.format(s.items_produced ?? 0)}**\nTransações **${nf.format(s.transactions ?? 0)}**`, inline: true },
      { name: '🎁 MEUS BÔNUS', value: bonusText(userId), inline: true },
      { name: '📬 RECOMPENSAS', value: `**${pending}** pendente(s) na Caixa Global`, inline: true }
    )
    .setFooter({ text: 'WarBoT • Perfil dinâmico • Os dados são lidos novamente ao atualizar' })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('profile:stats').setLabel('Estatísticas').setEmoji('📊').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('profile:achievements').setLabel('Conquistas').setEmoji('🏆').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('profile:war').setLabel('Guerra Mundial').setEmoji('🌍').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('profile:economy').setLabel('Economia').setEmoji('💰').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('profile:pro').setLabel('Pro').setEmoji('⭐').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('profile:inbox').setLabel('Recompensas').setEmoji('🎁').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('profile:bonuses').setLabel('Bônus').setEmoji('🎁').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('profile:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [e], components: [row1, row2] };
}

export function renderInbox(userId) {
  const list = rewards.inbox(userId);
  const text = list.length ? list.slice(0, 20).map(r => `🎁 **${r.title}**\nID: \`${r.id}\`\n${r.description || 'Sem descrição.'}`).join('\n\n') : 'Nenhuma recompensa pendente.';
  return new EmbedBuilder().setTitle('📬 Caixa Global de Recompensas').setDescription(text);
}

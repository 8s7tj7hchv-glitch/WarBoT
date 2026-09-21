import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { renderGlobalProfile, renderInbox } from './ProfilePanel.js';
import { renderBonusPanel } from './BonusPanel.js';
import { renderAchievements, handleAchievementInteraction } from './AchievementsPanel.js';
import { GlobalRewardManager } from '../global_profile/GlobalRewardManager.js';
import { ProfileManager } from '../players/ProfileManager.js';
import { StatisticsManager } from '../players/StatisticsManager.js';
import { WalletManager } from '../economy/WalletManager.js';
import { VipManager } from '../owner/VipManager.js';
import { ProPlayerManager } from '../pro/ProPlayerManager.js';

const rewards = new GlobalRewardManager();
const players = new ProfileManager();
const statistics = new StatisticsManager();
const wallet = new WalletManager();
const vip = new VipManager();
const pro = new ProPlayerManager();
const nf = new Intl.NumberFormat('pt-BR');
const money = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' });
const info = (title, description) => new EmbedBuilder().setTitle(title).setDescription(description);

export async function handleProfileUiInteraction(interaction) {
  const id = interaction.customId ?? '';
  if (id.startsWith('achievement:')) return handleAchievementInteraction(interaction);
  if (!id.startsWith('profile:')) return false;
  const uid = interaction.user.id;

  if (interaction.isButton() && id === 'profile:refresh') {
    await interaction.update(renderGlobalProfile(interaction)); return true;
  }
  if (interaction.isButton() && id === 'profile:stats') {
    const p=players.getOrCreate(uid, interaction.user.username), s=statistics.get(uid);
    await interaction.reply({ embeds:[info('📊 Estatísticas', `**Nível:** ${p.level ?? 1}\n**XP:** ${nf.format(p.xp ?? 0)}\n**Recursos coletados:** ${nf.format(s.resources_collected ?? 0)}\n**Itens produzidos:** ${nf.format(s.items_produced ?? 0)}\n**Itens vendidos:** ${nf.format(s.items_sold ?? 0)}\n**Itens comprados:** ${nf.format(s.items_bought ?? 0)}\n**Transações:** ${nf.format(s.transactions ?? 0)}\n**Ações de profissão:** ${nf.format(s.profession_actions ?? 0)}`)], ephemeral:true }); return true;
  }
  if (interaction.isButton() && id === 'profile:achievements') {
    await interaction.reply({ ...renderAchievements(uid), ephemeral:true }); return true;
  }
  if (interaction.isButton() && id === 'profile:war') {
    await interaction.reply({ embeds:[info('🌍 Guerra Mundial', 'Esta seção acompanha os dados registrados pelas missões e sistemas da Guerra Mundial. Use **🔄 Atualizar** no perfil depois de avançar no jogo para carregar os valores mais recentes.')], ephemeral:true }); return true;
  }
  if (interaction.isButton() && id === 'profile:economy') {
    await interaction.reply({ embeds:[info('💰 Economia', `**Carteira:** ${money.format(wallet.getBalance(uid))}\nOs demais dados econômicos continuam nos painéis de Economia.`)], ephemeral:true }); return true;
  }
  if (interaction.isButton() && id === 'profile:pro') {
    const active=vip.isPro(uid), pp=pro.profile(uid);
    await interaction.reply({ embeds:[info('⭐ Pro Player', `${active?'✅ **Ativo**':'❌ **Não ativo**'}\n🎟️ Pro Points: **${nf.format(pp.pro_points ?? 0)}**\n🔥 Sequência: **${nf.format(pp.streak ?? 0)} dia(s)**`)], ephemeral:true }); return true;
  }
  if (interaction.isButton() && id === 'profile:bonuses') {
    await interaction.reply({ ...renderBonusPanel(uid), ephemeral:true }); return true;
  }
  if (interaction.isButton() && id === 'profile:inbox') {
    const list=rewards.inbox(uid);
    const rows=list.slice(0,5).map(r=>new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`profile:claim:${r.id}`).setLabel(`Resgatar ${r.id}`.slice(0,80)).setEmoji('🎁').setStyle(ButtonStyle.Success)));
    await interaction.reply({ embeds:[renderInbox(uid)], components:rows, ephemeral:true }); return true;
  }
  if (interaction.isButton() && id.startsWith('profile:claim:')) {
    const r=rewards.claim(uid,id.slice('profile:claim:'.length));
    await interaction.update({ content:`✅ Recompensa **${r.title}** marcada como resgatada.`, embeds:[], components:[] }); return true;
  }
  return false;
}

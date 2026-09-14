import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { ExclusiveForcesManager } from '../owner/ExclusiveForcesManager.js';
import { VipManager } from '../owner/VipManager.js';
import { OwnerCombatManager } from '../owner/OwnerCombatManager.js';

const forces = new ExclusiveForcesManager();
const vip = new VipManager();
const combat = new OwnerCombatManager({ vip });

export function renderOwnerPanel(user) {
  const cfg = combat.config();
  const owned = forces.ownerForces(user.id);
  const pros = vip.listActive();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle('👑 Painel Exclusivo do Dono')
    .setDescription('Controle das forças fictícias exclusivas e do acesso **Pro Player**.')
    .addFields(
      { name: '⚔️ Multiplicador na guerra', value: `${cfg.ownerWarMultiplier}×`, inline: true },
      { name: '🛡️ Forças exclusivas', value: String(owned.length), inline: true },
      { name: '⭐ Pro Players ativos', value: String(pros.length), inline: true }
    )
    .setFooter({ text: 'Conteúdo de combate inteiramente fictício e abstrato.' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('owner:forces').setLabel('Minhas forças').setEmoji('🛡️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('owner:pro:list').setLabel('Pro Players').setEmoji('⭐').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('owner:pro:grant').setLabel('Presentear Pro').setEmoji('🎁').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('owner:pro:revoke').setLabel('Remover Pro').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('owner:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Secondary)
  );

  const catalog = forces.catalog();
  const select = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('owner:force:create')
      .setPlaceholder('Criar força exclusiva')
      .addOptions(catalog.slice(0, 25).map(item => ({
        label: item.name.slice(0, 100),
        value: item.id,
        emoji: item.emoji,
        description: item.description.slice(0, 100)
      })))
  );

  return { embeds: [embed], components: [row, select] };
}

export function renderOwnerForces(userId) {
  const list = forces.ownerForces(userId);
  const description = list.length
    ? list.slice(0, 20).map((item, index) => {
        const s = item.game_stats ?? {};
        return `**${index + 1}. ${item.name}** — ${item.category}\n⚔️ ${s.power ?? 0} • 🛡️ ${s.defense ?? 0} • 🏃 ${s.mobility ?? 0} • 🧰 ${s.support ?? 0}`;
      }).join('\n\n')
    : 'Nenhuma força exclusiva criada ainda.';

  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle('🛡️ Forças exclusivas')
    .setDescription(description);
}

export function renderProPlayers() {
  const list = vip.listActive();
  const description = list.length
    ? list.slice(0, 25).map(entry => `⭐ <@${entry.user_id}> — ${entry.expires_at ? `<t:${Math.floor(new Date(entry.expires_at).getTime() / 1000)}:R>` : '**permanente**'}`).join('\n')
    : 'Nenhum Pro Player ativo.';
  return new EmbedBuilder().setColor(EMBED_COLOR).setTitle('⭐ Pro Players').setDescription(description);
}

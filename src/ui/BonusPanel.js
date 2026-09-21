import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} from 'discord.js';

import { BonusManager } from '../bonuses/BonusManager.js';

const bonuses = new BonusManager();

const LABEL = {
  common: '⚪ Comum',
  uncommon: '🟢 Incomum',
  rare: '🔵 Raro',
  epic: '🟣 Épico',
  legendary: '🟡 Lendário',
  mythic: '🔴 Mítico'
};

function effectText(e = {}) {
  const entries = Object.entries(e);

  return entries.length
    ? entries
        .map(([k, v]) => `• ${k}: +${v}%`)
        .join('\n')
    : 'Sem efeito configurado.';
}

export function renderBonusPanel(userId) {
  const all = bonuses.active(userId);

  const equipped = all.filter((x) => x.equipped);

  const desc = equipped.length
    ? equipped
        .map(
          (x, i) =>
            `**Slot ${i + 1}** — ${x.definition.emoji} ${x.definition.name}\n` +
            `${LABEL[x.rarity] ?? x.rarity}\n` +
            `${effectText(x.definition.effects)}`
        )
        .join('\n\n')
    : 'Nenhum bônus equipado.';

  const e = new EmbedBuilder()
    .setTitle('🎁 Bônus & Raridades')
    .setDescription(desc)
    .addFields(
      {
        name: '🎒 Coleção',
        value: `${all.length} bônus ativo(s)`,
        inline: true
      },
      {
        name: '⚙️ Slots',
        value: `${equipped.length}/3`,
        inline: true
      }
    )
    .setFooter({
      text: 'Bônus do jogador • Owner permanece separado'
    });

  const rows = [];

  // ==========================================
  // ⚙️ EQUIPAR BÔNUS
  // ==========================================

  if (all.length) {
    const equipMenu = new StringSelectMenuBuilder()
      .setCustomId('bonus:equip')
      .setPlaceholder('⚙️ Equipar bônus')
      .addOptions(
        all.slice(0, 25).map((x) => ({
          label: x.definition.name.slice(0, 100),
          description: (LABEL[x.rarity] ?? x.rarity).slice(0, 100),
          value: x.id,
          emoji: x.definition.emoji
        }))
      );

    rows.push(
      new ActionRowBuilder().addComponents(equipMenu)
    );
  }

  // ==========================================
  // ❌ DESEQUIPAR BÔNUS
  // ==========================================

  if (equipped.length) {
    const unequipMenu = new StringSelectMenuBuilder()
      .setCustomId('bonus:unequip')
      .setPlaceholder('❌ Desequipar bônus')
      .addOptions(
        equipped.slice(0, 25).map((x) => ({
          label: x.definition.name.slice(0, 100),
          value: x.id,
          emoji: x.definition.emoji
        }))
      );

    rows.push(
      new ActionRowBuilder().addComponents(unequipMenu)
    );
  }

  // ==========================================
  // 🔄 ATUALIZAR
  // ==========================================

  const refreshButton = new ButtonBuilder()
    .setCustomId('bonus:refresh')
    .setLabel('Atualizar')
    .setEmoji('🔄')
    .setStyle(ButtonStyle.Secondary);

  rows.push(
    new ActionRowBuilder().addComponents(refreshButton)
  );

  return {
    embeds: [e],
    components: rows
  };
}
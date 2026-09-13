import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { InventoryManager } from '../inventory/InventoryManager.js';

const inventory = new InventoryManager();

export default {
  data: new SlashCommandBuilder()
    .setName('inventario')
    .setDescription('Mostra seu inventário e a capacidade utilizada.'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const items = inventory.listItems(userId);
    const used = inventory.getUsedCapacity(userId);
    const maximum = inventory.getMaxCapacity(userId);
    const free = inventory.getFreeCapacity(userId);

    const lines = items.slice(0, 15).map((item) =>
      `${item.emoji} **${item.name}** ×${item.quantity} • Q${item.quality} • ${item.weight} peso`
    );

    if (items.length > 15) lines.push(`… e mais **${items.length - 15}** tipo(s) de item.`);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle('🎒 Inventário')
      .setDescription(lines.length ? lines.join('\n') : 'Seu inventário está vazio.')
      .addFields({
        name: '📦 Capacidade',
        value: `Usado: **${used}/${maximum}**\nLivre: **${free}**`,
        inline: false
      })
      .setFooter({ text: 'Migração Python → Node.js • Etapa 3' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

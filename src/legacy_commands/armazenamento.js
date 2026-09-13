import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { StorageManager } from '../storage/StorageManager.js';

const storage = new StorageManager();
const LABELS = {
  warehouse: '🏬 Armazém',
  industrial: '🏭 Estoque Industrial',
  garage: '🚗 Garagem'
};

export default {
  data: new SlashCommandBuilder()
    .setName('armazenamento')
    .setDescription('Mostra um dos seus armazenamentos.')
    .addStringOption((option) =>
      option
        .setName('tipo')
        .setDescription('Escolha o armazenamento.')
        .setRequired(true)
        .addChoices(
          { name: 'Armazém', value: 'warehouse' },
          { name: 'Industrial', value: 'industrial' },
          { name: 'Garagem', value: 'garage' }
        )
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const type = interaction.options.getString('tipo', true);
    const items = storage.listItems(userId, type);
    const used = storage.getUsedCapacity(userId, type);
    const maximum = storage.getMaxCapacity(userId, type);
    const free = storage.getFreeCapacity(userId, type);

    const lines = items.slice(0, 15).map((item) =>
      `${item.emoji} **${item.name}** ×${item.quantity} • Q${item.quality}`
    );
    if (items.length > 15) lines.push(`… e mais **${items.length - 15}** tipo(s) de item.`);

    const unit = type === 'garage' ? 'vaga(s)' : 'peso';
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(LABELS[type] ?? '📦 Armazenamento')
      .setDescription(lines.length ? lines.join('\n') : 'Este armazenamento está vazio.')
      .addFields({
        name: '📊 Capacidade',
        value: `Usado: **${used}/${maximum} ${unit}**\nLivre: **${free} ${unit}**`,
        inline: false
      })
      .setFooter({ text: 'Migração Python → Node.js • Etapa 3' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

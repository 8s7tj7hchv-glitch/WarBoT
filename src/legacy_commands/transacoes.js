import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { EconomyService } from '../economy/EconomyService.js';

const economy = new EconomyService();
const LABELS = {
  deposit: '🏦 Depósito',
  withdraw: '💵 Saque',
  transfer: '🔁 Transferência'
};

export default {
  data: new SlashCommandBuilder()
    .setName('transacoes')
    .setDescription('Mostra suas últimas transações.'),

  async execute(interaction) {
    const history = economy.transactions.getUserHistory(interaction.user.id, 10);

    const lines = history.map((item) => {
      const label = LABELS[item.type] ?? `📄 ${item.type}`;
      const amount = Number(item.amount ?? 0).toFixed(2);
      const date = new Date(item.created_at);
      const timestamp = Number.isNaN(date.getTime()) ? '' : `<t:${Math.floor(date.getTime() / 1000)}:R>`;
      const isIncoming = String(item.target_id ?? '') === String(interaction.user.id) && item.type === 'transfer';
      const direction = item.type === 'transfer' ? (isIncoming ? '⬇️' : '⬆️') : '•';
      return `${direction} **${label}** — $ ${amount} ${timestamp}`.trim();
    });

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle('📜 Histórico de Transações')
      .setDescription(lines.length ? lines.join('\n') : 'Nenhuma transação registrada ainda.')
      .setFooter({ text: 'Últimas 10 transações' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

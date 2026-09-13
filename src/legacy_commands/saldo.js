import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { EconomyService } from '../economy/EconomyService.js';

const economy = new EconomyService();
const formatMoney = (value) => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default {
  data: new SlashCommandBuilder()
    .setName('saldo')
    .setDescription('Mostra sua carteira e saldo bancário.'),

  async execute(interaction) {
    const balances = economy.balances(interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle('💰 Economia')
      .addFields(
        { name: '👛 Carteira', value: `**$ ${formatMoney(balances.wallet)}**`, inline: true },
        { name: '🏦 Banco', value: `**$ ${formatMoney(balances.bank)}**`, inline: true },
        { name: '💵 Total líquido', value: `**$ ${formatMoney(balances.total)}**`, inline: false }
      )
      .setFooter({ text: 'BoTNT • Economia Node.js' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

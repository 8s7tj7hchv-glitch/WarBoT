import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { EconomyService } from '../economy/EconomyService.js';

const economy = new EconomyService();

export default {
  data: new SlashCommandBuilder()
    .setName('sacar')
    .setDescription('Saca dinheiro do banco para a carteira.')
    .addNumberOption((option) => option
      .setName('valor')
      .setDescription('Valor que deseja sacar.')
      .setMinValue(0.01)
      .setRequired(true)),

  async execute(interaction) {
    const amount = interaction.options.getNumber('valor', true);
    const [success, message] = economy.withdraw(interaction.user.id, amount);
    const balances = economy.balances(interaction.user.id);

    await interaction.reply({
      content: `${success ? '✅' : '❌'} ${message}\n👛 Carteira: **$ ${balances.wallet.toFixed(2)}**\n🏦 Banco: **$ ${balances.bank.toFixed(2)}**`,
      flags: MessageFlags.Ephemeral
    });
  }
};

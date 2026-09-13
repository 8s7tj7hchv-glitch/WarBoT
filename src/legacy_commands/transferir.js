import { SlashCommandBuilder } from 'discord.js';
import { EconomyService } from '../economy/EconomyService.js';

const economy = new EconomyService();

export default {
  data: new SlashCommandBuilder()
    .setName('transferir')
    .setDescription('Transfere dinheiro da sua carteira para outro jogador.')
    .addUserOption((option) => option
      .setName('jogador')
      .setDescription('Jogador que receberá o dinheiro.')
      .setRequired(true))
    .addNumberOption((option) => option
      .setName('valor')
      .setDescription('Valor da transferência.')
      .setMinValue(0.01)
      .setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('jogador', true);
    const amount = interaction.options.getNumber('valor', true);

    if (target.bot) {
      await interaction.reply({ content: '❌ Não é possível transferir dinheiro para bots.', ephemeral: true });
      return;
    }

    const [success, message] = economy.transfer(interaction.user.id, target.id, amount);
    const balances = economy.balances(interaction.user.id);

    await interaction.reply({
      content: `${success ? '✅' : '❌'} ${message}${success ? `\n👤 Destino: **${target.username}**` : ''}\n👛 Sua carteira: **$ ${balances.wallet.toFixed(2)}**`,
      ephemeral: true
    });
  }
};

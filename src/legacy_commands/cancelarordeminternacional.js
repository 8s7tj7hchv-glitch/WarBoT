import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { InternationalMarketManager } from '../market/InternationalMarketManager.js';
const market = new InternationalMarketManager();

export const data = new SlashCommandBuilder()
  .setName('cancelarordeminternacional')
  .setDescription('Cancela uma ordem internacional sua.')
  .addStringOption((o) => o.setName('tipo').setDescription('Tipo').setRequired(true).addChoices({ name: 'Venda', value: 'sell' }, { name: 'Compra', value: 'buy' }))
  .addStringOption((o) => o.setName('id').setDescription('ID da ordem').setRequired(true));

export async function execute(interaction) {
  const type = interaction.options.getString('tipo');
  const id = interaction.options.getString('id');
  const [ok, msg] = type === 'sell' ? market.cancelSellOrder(interaction.user.id, id) : market.cancelBuyOrder(interaction.user.id, id);
  await interaction.reply({ content: `${ok ? '✅' : '❌'} ${msg}`, flags: MessageFlags.Ephemeral });
}

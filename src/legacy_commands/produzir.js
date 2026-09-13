import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ProductionManager } from '../production/ProductionManager.js';
import { SUCCESS_COLOR, ERROR_COLOR } from '../config/settings.js';
const production = new ProductionManager();
export default {
  data: new SlashCommandBuilder().setName('produzir').setDescription('Produz um item usando uma receita.').addStringOption((o) => o.setName('receita').setDescription('ID da receita, ex: refine_iron').setRequired(true)).addIntegerOption((o) => o.setName('quantidade').setDescription('Quantidade de lotes').setMinValue(1).setMaxValue(100)),
  async execute(interaction) {
    const recipeId = interaction.options.getString('receita', true); const amount = interaction.options.getInteger('quantidade') ?? 1;
    const [ok, message, result] = production.craft(interaction.user.id, recipeId, amount);
    const embed = new EmbedBuilder().setColor(ok ? SUCCESS_COLOR : ERROR_COLOR).setTitle(ok ? '✅ Produção concluída' : '❌ Produção indisponível').setDescription(message);
    if (ok && result) embed.addFields({ name: 'Produto', value: `\`${result.item_id}\` × ${result.quantity}`, inline: true }, { name: 'Qualidade', value: String(result.quality), inline: true }, { name: 'Energia usada', value: String(result.energy_used), inline: true });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

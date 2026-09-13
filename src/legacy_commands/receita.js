import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { RecipeRegistry } from '../production/RecipeRegistry.js';
import { EMBED_COLOR, ERROR_COLOR } from '../config/settings.js';
const recipes = new RecipeRegistry();
export default {
  data: new SlashCommandBuilder().setName('receita').setDescription('Mostra os detalhes de uma receita.').addStringOption((o) => o.setName('id').setDescription('ID da receita').setRequired(true)),
  async execute(interaction) {
    const recipe = recipes.get(interaction.options.getString('id', true));
    if (!recipe) return interaction.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setTitle('❌ Receita não encontrada')], ephemeral: true });
    const inputs = Object.entries(recipe.inputs ?? {}).map(([id, q]) => `• ${id} × ${q}`).join('\n') || 'Nenhum';
    const out = recipe.output ?? {};
    const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle(`📜 ${recipe.name ?? recipe.id}`).addFields(
      { name: 'ID', value: `\`${recipe.id}\``, inline: true }, { name: 'Categoria', value: recipe.category, inline: true }, { name: 'Nível', value: String(recipe.required_level ?? 1), inline: true }, { name: 'Energia', value: String(recipe.energy_cost ?? 0), inline: true }, { name: 'Tempo base', value: `${recipe.duration_seconds ?? 0}s`, inline: true }, { name: 'Qualidade base', value: String(recipe.base_quality ?? 50), inline: true }, { name: 'Entradas', value: inputs }, { name: 'Saída', value: `${out.item_id ?? '?'} × ${out.quantity ?? 1}` }
    );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

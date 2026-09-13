import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { RecipeRegistry } from '../production/RecipeRegistry.js';
import { EMBED_COLOR } from '../config/settings.js';
const recipes = new RecipeRegistry();
export default {
  data: new SlashCommandBuilder().setName('receitas').setDescription('Lista receitas de produção.').addStringOption((o) => o.setName('categoria').setDescription('Categoria').addChoices(
    { name: 'Refino', value: 'refining' }, { name: 'Componentes', value: 'components' }, { name: 'Ferramentas', value: 'tools' }, { name: 'Máquinas', value: 'machinery' }, { name: 'Veículos', value: 'vehicles' }
  )),
  async execute(interaction) {
    const category = interaction.options.getString('categoria');
    const list = category ? recipes.listCategory(category) : recipes.listAll();
    const lines = list.slice(0, 20).map((r) => `• \`${r.id}\` — ${r.name ?? r.id} (Nv. ${r.required_level ?? 1})`);
    const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('📜 Receitas de Produção').setDescription(lines.join('\n') || 'Nenhuma receita encontrada.').setFooter({ text: `${list.length} receita(s)${list.length > 20 ? ' • exibindo 20' : ''}` });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

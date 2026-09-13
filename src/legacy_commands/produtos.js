import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ProductRegistry } from '../products/ProductRegistry.js';
import { EMBED_COLOR } from '../config/settings.js';
const registry = new ProductRegistry();
export default {
  data: new SlashCommandBuilder().setName('produtos').setDescription('Mostra os produtos cadastrados no jogo.'),
  async execute(interaction) {
    const c = registry.countByCategory();
    const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🏭 Produtos').setDescription(`Total cadastrado: **${registry.count()}**`).addFields(
      { name: 'Componentes', value: String(c.components ?? 0), inline: true }, { name: 'Ferramentas', value: String(c.tools ?? 0), inline: true }, { name: 'Máquinas', value: String(c.machinery ?? 0), inline: true }, { name: 'Veículos', value: String(c.vehicles ?? 0), inline: true }, { name: 'Construção', value: String(c.construction ?? 0), inline: true }
    );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { MilitaryIndustryHubService } from '../military_industry/MilitaryIndustryHubService.js';
const pct = (n) => `${Math.round(Number(n ?? 0) * 100)}%`;
export default {
  data: new SlashCommandBuilder().setName('industriamilitar').setDescription('Mostra a indústria militar nacional fictícia.'),
  async execute(i) {
    const d = new MilitaryIndustryHubService().dashboard(i.user.id);
    const embed = new EmbedBuilder().setTitle('🏭 Indústria Militar Nacional').setDescription('Pesquisa, tecnologia, complexos, produção, manutenção e estoques — tudo abstrato e fictício de jogo.');
    if (!d.country) embed.addFields({ name: 'País', value: 'Você ainda não pertence a um país.' });
    else embed.addFields(
      { name: '🏳️ País', value: `${d.country.emoji} **${d.country.name}**`, inline: false },
      { name: '🔬 Pesquisa', value: `Pontos: **${d.research.points}**\nTecnologias: **${d.technologies.unlocked}/${d.technologies.total}**`, inline: true },
      { name: '🏭 Complexos', value: `**${d.complexes.length}** complexo(s) nacional(is)`, inline: true },
      { name: '📦 Estoque nacional', value: `**${d.stockpile.used}/${d.stockpile.capacity}**\n${d.stockpile.items} tipo(s) de item`, inline: true },
      { name: '⚙️ Produção', value: `Receitas liberadas: **${d.recipes.unlocked}/${d.recipes.total}**\nBônus: **${pct(d.bonuses.production)}**`, inline: true },
      { name: '🔧 Manutenção', value: `Bônus: **${pct(d.bonuses.maintenance)}**`, inline: true },
      { name: '🧪 Pesquisa', value: `Bônus de centros: **${pct(d.bonuses.research)}**`, inline: true }
    );
    await i.reply({ embeds: [embed], ephemeral: true });
  }
};

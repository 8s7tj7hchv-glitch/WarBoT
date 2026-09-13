import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CountryManager } from '../world/CountryManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
import { MilitaryComplexManager } from '../military_industry/MilitaryComplexManager.js';
export default {
  data: new SlashCommandBuilder().setName('complexosmilitares').setDescription('Lista os complexos industriais militares do seu país.'),
  async execute(i) {
    const countries = new CountryManager(), country = countries.memberCountry(i.user.id), manager = new MilitaryComplexManager(), territories = new TerritoryManager();
    if (!country) return i.reply({ content: '❌ Você precisa pertencer a um país.', ephemeral: true });
    const list = manager.list(country.id);
    const lines = list.map((c) => { const d = manager.getDefinition(c.type); const t = territories.get(c.territory_id); return `${d?.emoji ?? '🏭'} **${c.name}** • Nv. ${c.level} • ${t?.name ?? c.territory_id}`; });
    await i.reply({ embeds: [new EmbedBuilder().setTitle('🏭 Complexos Militares').setDescription(lines.length ? lines.join('\n').slice(0, 4000) : 'Nenhum complexo nacional construído.')], ephemeral: true });
  }
};

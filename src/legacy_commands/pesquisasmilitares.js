import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CountryManager } from '../world/CountryManager.js';
import { TechnologyManager } from '../military_industry/TechnologyManager.js';
export default {
  data: new SlashCommandBuilder().setName('pesquisasmilitares').setDescription('Mostra a árvore tecnológica militar fictícia.'),
  async execute(i){
    const countries=new CountryManager(),country=countries.memberCountry(i.user.id),tech=new TechnologyManager();
    if(!country)return i.reply({content:'❌ Você precisa pertencer a um país.',ephemeral:true});
    const state=tech.state(country.id);
    const lines=tech.list().map(t=>`${tech.isUnlocked(country.id,t.id)?'✅':'⬜'} ${t.emoji??'🔬'} **${t.name}** • ${t.cost} pts${(t.prerequisites??[]).length?` • pré: ${t.prerequisites.join(', ')}`:''}`);
    await i.reply({embeds:[new EmbedBuilder().setTitle('🔬 Pesquisa & Tecnologia').setDescription(lines.join('\n').slice(0,4000)).addFields({name:'Pontos disponíveis',value:String(state.points),inline:true},{name:'Desbloqueadas',value:`${state.unlocked.length}/${tech.list().length}`,inline:true})],ephemeral:true});
  }
};

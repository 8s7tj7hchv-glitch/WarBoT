import { SlashCommandBuilder } from 'discord.js';
import { CountryManager } from '../world/CountryManager.js';
import { TechnologyManager } from '../military_industry/TechnologyManager.js';
import { MilitaryComplexManager } from '../military_industry/MilitaryComplexManager.js';
import { ResearchManager } from '../military_industry/ResearchManager.js';
const choices=[['Fundamentos Industriais','industrial_foundations'],['Eletrônica Estratégica','advanced_electronics'],['Indústria Mecanizada','mechanized_industry'],['Indústria Aeroespacial','aerospace_industry'],['Indústria Naval','naval_industry'],['Sistemas Estratégicos','strategic_systems'],['Automação Industrial','industrial_automation'],['Doutrina de Manutenção','maintenance_doctrine']].map(([name,value])=>({name,value}));
export default {
  data:new SlashCommandBuilder().setName('desbloqueartecnologia').setDescription('Desbloqueia uma tecnologia nacional usando pontos de pesquisa.').addStringOption(o=>o.setName('tecnologia').setDescription('Tecnologia').setRequired(true).addChoices(...choices)),
  async execute(i){const countries=new CountryManager(),tech=new TechnologyManager(),complexes=new MilitaryComplexManager({countries,technologies:tech}),research=new ResearchManager({countries,technologies:tech,complexes});const [ok,msg,d]=research.unlock(i.user.id,i.options.getString('tecnologia'));await i.reply({content:`${ok?'✅':'❌'} ${msg}${d?`\nPontos restantes: **${d.remaining_points}**`:''}`,ephemeral:true});}
};

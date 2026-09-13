import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { CountryManager } from '../world/CountryManager.js';
import { TechnologyManager } from '../military_industry/TechnologyManager.js';
import { MilitaryComplexManager } from '../military_industry/MilitaryComplexManager.js';
import { ResearchManager } from '../military_industry/ResearchManager.js';
export default {
  data:new SlashCommandBuilder().setName('financiarpesquisa').setDescription('Investe dinheiro em pesquisa nacional.').addIntegerOption(o=>o.setName('valor').setDescription('Valor a investir').setMinValue(10).setRequired(true)),
  async execute(i){const countries=new CountryManager(),tech=new TechnologyManager(),complexes=new MilitaryComplexManager({countries,technologies:tech}),research=new ResearchManager({countries,technologies:tech,complexes});const [ok,msg,d]=research.fund(i.user.id,i.options.getInteger('valor'));await i.reply({content:`${ok?'✅':'❌'} ${msg}${d?`\nPontos disponíveis: **${d.balance_points}**`:''}`,flags: MessageFlags.Ephemeral});}
};

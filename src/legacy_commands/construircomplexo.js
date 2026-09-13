import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { MilitaryComplexManager } from '../military_industry/MilitaryComplexManager.js';
const choices = [
  ['Centro de Pesquisa Estratégica','research_center'],['Complexo de Componentes','component_complex'],['Complexo Industrial Estratégico','strategic_factory'],['Complexo Eletrônico Orion','electronics_complex'],['Complexo de Veículos Guardian','vehicle_complex'],['Complexo Aeroespacial Falcon','aerospace_complex'],['Complexo Naval Triton','naval_complex'],['Complexo de Sistemas Aegis','strategic_systems_complex'],['Depósito Nacional Estratégico','national_depot']
].map(([name,value])=>({name,value}));
export default {
  data: new SlashCommandBuilder().setName('construircomplexo').setDescription('Constrói ou melhora um complexo industrial militar nacional.').addStringOption(o=>o.setName('territorio').setDescription('ID do território controlado').setRequired(true)).addStringOption(o=>o.setName('tipo').setDescription('Tipo de complexo').setRequired(true).addChoices(...choices)),
  async execute(i){ const [ok,msg,data]=new MilitaryComplexManager().build(i.user.id,i.options.getString('territorio'),i.options.getString('tipo')); await i.reply({content:`${ok?'✅':'❌'} ${msg}${data?`\nNível atual: **${data.level}**`:''}`,flags: MessageFlags.Ephemeral}); }
};

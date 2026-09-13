import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { MilitaryMaintenanceManager } from '../military_industry/MilitaryMaintenanceManager.js';
export default {
  data:new SlashCommandBuilder().setName('manutencaomilitar').setDescription('Executa manutenção de unidades ou ativos fictícios.').addSubcommand(s=>s.setName('unidade').setDescription('Mantém uma unidade').addStringOption(o=>o.setName('id').setDescription('ID da unidade').setRequired(true))).addSubcommand(s=>s.setName('ativo').setDescription('Mantém um ativo').addStringOption(o=>o.setName('id').setDescription('ID do ativo').setRequired(true))),
  async execute(i){const m=new MilitaryMaintenanceManager(),sub=i.options.getSubcommand(),id=i.options.getString('id');const [ok,msg,d]=sub==='unidade'?m.maintainUnit(i.user.id,id):m.maintainAsset(i.user.id,id);await i.reply({content:`${ok?'✅':'❌'} ${msg}${d?`\nProntidão: **${d.readiness}%**${d.condition!=null?` • Condição: **${d.condition}%**`:''}`:''}`,flags: MessageFlags.Ephemeral});}
};

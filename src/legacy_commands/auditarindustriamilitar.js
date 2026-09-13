import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { MilitaryIndustryHubService } from '../military_industry/MilitaryIndustryHubService.js';
export default {
  data:new SlashCommandBuilder().setName('auditarindustriamilitar').setDescription('Audita referências da indústria militar fictícia.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i){const a=new MilitaryIndustryHubService().audit();const lines=a.issues.slice(0,25).map(x=>`• ${x.type}: ${JSON.stringify(x)}`);await i.reply({embeds:[new EmbedBuilder().setTitle('🧪 Auditoria da Indústria Militar').setDescription(a.ok?'✅ Nenhuma inconsistência estrutural detectada.':`⚠️ ${a.issues.length} problema(s)\n${lines.join('\n').slice(0,3500)}`)],flags: MessageFlags.Ephemeral});}
};

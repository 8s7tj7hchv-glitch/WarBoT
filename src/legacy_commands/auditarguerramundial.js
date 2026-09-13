import { PermissionFlagsBits, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { WorldWarHubService } from '../global_war/WorldWarHubService.js';
const hub=new WorldWarHubService();
export default{data:new SlashCommandBuilder().setName('auditarguerramundial').setDescription('Audita integridade da integração mundial.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),async execute(i){const a=hub.audit();await i.reply({content:a.ok?'✅ Integração mundial consistente.':`⚠️ ${a.issues.length} problema(s):\n${a.issues.slice(0,15).map(x=>`• ${x}`).join('\n')}`,flags: MessageFlags.Ephemeral})}};

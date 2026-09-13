import { SlashCommandBuilder } from 'discord.js'; import { LogisticsManager } from '../market/LogisticsManager.js'; const logistics=new LogisticsManager();
export const data=new SlashCommandBuilder().setName('entregarfrete').setDescription('Conclui a entrega de um frete P2P.').addStringOption(o=>o.setName('id').setDescription('ID do frete').setRequired(true));
export async function execute(interaction){const [ok,msg]=logistics.deliver(interaction.user.id,interaction.options.getString('id'));await interaction.reply({content:`${ok?'✅':'❌'} ${msg}`,ephemeral:true});}

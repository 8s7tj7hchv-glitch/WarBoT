import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { MilitaryAssetManager } from '../military/MilitaryAssetManager.js';
const countries=new CountryManager(),assets=new MilitaryAssetManager({countries});
export default{data:new SlashCommandBuilder().setName('ativosmilitares').setDescription('Lista veículos, aeronaves, navios e sistemas fictícios incorporados.'),async execute(i){const c=countries.memberCountry(i.user.id);if(!c)return i.reply({content:'❌ Você não pertence a um país.',ephemeral:true});const list=assets.list(c.id);const desc=list.length?list.slice(0,25).map(x=>`${x.emoji} **${x.name}** • ${x.status} • Prontidão ${x.readiness}% • ${x.territory_id??'sem base'}`).join('\n'):'Nenhum ativo incorporado.';await i.reply({embeds:[new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🛡️ Ativos militares fictícios').setDescription(desc)],ephemeral:true})}};

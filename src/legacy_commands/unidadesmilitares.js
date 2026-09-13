import { EmbedBuilder, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { UnitManager } from '../military/UnitManager.js';
const countries=new CountryManager(),units=new UnitManager({countries});
export default{data:new SlashCommandBuilder().setName('unidadesmilitares').setDescription('Lista as unidades militares fictícias do seu país.'),async execute(i){const c=countries.memberCountry(i.user.id);if(!c)return i.reply({content:'❌ Você não pertence a um país.',flags: MessageFlags.Ephemeral});const list=units.list(c.id);const desc=list.length?list.slice(0,25).map(x=>`${x.branch==='army'?'🪖':x.branch==='air_force'?'✈️':x.branch==='navy'?'⚓':'🛰️'} **${x.name}** • ${x.id.slice(0,16)}… • Prontidão ${x.readiness}% • ${x.territory_id??'sem base'}`).join('\n'):'Nenhuma unidade criada.';await i.reply({embeds:[new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🪖 Unidades militares').setDescription(desc)],flags: MessageFlags.Ephemeral})}};

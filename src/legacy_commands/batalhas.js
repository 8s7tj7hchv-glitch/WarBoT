import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { CountryManager } from '../world/CountryManager.js';
import { BattleResolver } from '../warfare/BattleResolver.js';
const countries=new CountryManager(), resolver=new BattleResolver();
export default{data:new SlashCommandBuilder().setName('batalhas').setDescription('Mostra o histórico recente de batalhas do seu país.'),async execute(i){const c=countries.memberCountry(i.user.id);if(!c)return i.reply({content:'❌ Você não pertence a um país.',ephemeral:true});const list=resolver.list().filter(b=>b.attacker_country_id===c.id||b.defender_country_id===c.id).slice(-10).reverse();const text=list.map(b=>`• ${b.created_at.slice(0,10)} • ${b.target_territory_id} • ${b.winner_country_id===c.id?'✅ vitória':'❌ derrota'} • ${b.attacker_score}×${b.defender_score}`).join('\n')||'Nenhuma batalha registrada.';await i.reply({embeds:[new EmbedBuilder().setColor(EMBED_COLOR).setTitle('📜 Histórico de batalhas').setDescription(text)],ephemeral:true})}};

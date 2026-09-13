import { SlashCommandBuilder } from 'discord.js';
import { CountryManager } from '../world/CountryManager.js';
const countries = new CountryManager();
export default { data: new SlashCommandBuilder().setName('entrarpais').setDescription('Entra no país deste servidor.'), async execute(i) { const c = countries.getByGuild(i.guildId); if (!c) return i.reply({ content: '❌ Este servidor ainda não possui país.', ephemeral: true }); countries.join(i.user.id, c.id); await i.reply({ content: `✅ Agora você faz parte de ${c.emoji} **${c.name}**.`, ephemeral: true }); } };

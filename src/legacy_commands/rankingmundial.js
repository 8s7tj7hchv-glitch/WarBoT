import { EmbedBuilder, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { WorldRankingService } from '../global_war/WorldRankingService.js';
const ranking=new WorldRankingService();
export default{data:new SlashCommandBuilder().setName('rankingmundial').setDescription('Mostra o ranking global de países do jogo.'),async execute(i){const rows=ranking.calculate().slice(0,15);const lines=rows.map(r=>`**${r.rank}.** ${r.emoji} ${r.name} [${r.code}] • **${r.score} pts** • 🗺️ ${r.controlled} • 🏗️ ${r.infrastructure} • estabilidade ${r.stability}`).join('\n')||'Nenhum país registrado.';const e=new EmbedBuilder().setColor(EMBED_COLOR).setTitle('🏆 Ranking Mundial').setDescription(lines);await i.reply({embeds:[e],flags: MessageFlags.Ephemeral})}};

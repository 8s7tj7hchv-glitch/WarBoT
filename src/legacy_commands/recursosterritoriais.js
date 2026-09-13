import { SlashCommandBuilder } from 'discord.js';
import { TerritoryResourceManager } from '../world/TerritoryResourceManager.js';
const rm = new TerritoryResourceManager();
export default { data: new SlashCommandBuilder().setName('recursosterritoriais').setDescription('Mostra bônus de recursos de um território.').addStringOption((o) => o.setName('id').setDescription('ID do território').setRequired(true)), async execute(i) { const s = rm.summary(i.options.getString('id')); if (!s) return i.reply({ content: '❌ Território não encontrado.', ephemeral: true }); const lines = Object.entries(s.bonuses).map(([k, v]) => `• ${k}: **×${v}**`); await i.reply({ content: `⛏️ **${s.territory_name}**\n${lines.join('\n') || 'Sem bônus especiais.'}`, ephemeral: true }); } };

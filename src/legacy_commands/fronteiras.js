import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { TerritoryManager } from '../world/TerritoryManager.js';
import { BorderManager } from '../world/BorderManager.js';
const tm = new TerritoryManager(), bm = new BorderManager();
export default { data: new SlashCommandBuilder().setName('fronteiras').setDescription('Mostra os territórios vizinhos.').addStringOption((o) => o.setName('id').setDescription('ID do território').setRequired(true)), async execute(i) { const t = tm.get(i.options.getString('id')); if (!t) return i.reply({ content: '❌ Território não encontrado.', flags: MessageFlags.Ephemeral }); const list = bm.neighbors(t.id).map((id) => { const n = tm.get(id); return `${n?.emoji ?? '🗺️'} ${n?.name ?? id}`; }); await i.reply({ content: `🧭 **Fronteiras de ${t.name}**\n${list.join('\n') || 'Nenhuma fronteira.'}`, flags: MessageFlags.Ephemeral }); } };

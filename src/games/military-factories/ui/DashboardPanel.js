import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { industrialDashboardManager } from '../dashboard/IndustrialDashboardManager.js';

function n(value) { return Number(value || 0).toLocaleString('pt-BR'); }
export function renderIndustrialDashboardPanel(userId) {
  const s = industrialDashboardManager.snapshot(userId);
  const st = s.statistics || {};
  const wh = s.warehouse || {};
  const wf = s.workforce || {};
  const rep = s.reputation;
  const embed = new EmbedBuilder()
    .setTitle('📊 PAINEL GERAL DE GESTÃO INDUSTRIAL')
    .setDescription('Visão consolidada das Fábricas Militares. Os valores são lidos do progresso atual do jogador.')
    .addFields(
      { name: '🏭 Fábricas', value: `${n(st.initialized)}/${n(st.factoriesAvailable)} inicializadas\nNível médio: ${Number(st.averageLevel || 0).toFixed(1)}\nProduções: ${n(st.completed)} concluídas • ${n(st.active)} ativas`, inline: true },
      { name: '💰 Economia', value: `Saldo: ${n(st.balance)} créditos\nRecebido: ${n(st.received)}\nGasto: ${n(st.spent)}`, inline: true },
      { name: '🏬 Armazém', value: `Nível ${n(wh.level)}\n${n(wh.used)}/${n(wh.capacity)} ocupado (${n(wh.percent)}%)\nLivre: ${n(wh.free)}`, inline: true },
      { name: '👷 Mão de obra', value: `${n(wf.workers)} trabalhadores\nCapacidade efetiva: ${n(wf.capacity)}\nMoral: ${n(wf.morale)}% • Turno: ${wf.shiftMeta?.name || 'Normal'}`, inline: true },
      { name: '🔬 Pesquisa', value: `${n(s.research.totalLevels)} níveis acumulados\n${n(s.research.areas)} áreas pesquisadas\nMédia: ${Number(s.research.average || 0).toFixed(1)}`, inline: true },
      { name: '📑 Contratos', value: `${n(s.contracts.open)} abertos\n${n(s.contracts.active)} ativos\n${n(s.contracts.completed)} concluídos`, inline: true },
      { name: '🔔 Alertas', value: `🚨 ${n(s.alerts.critical)} críticos • ⚠️ ${n(s.alerts.warning)} atenção • ℹ️ ${n(s.alerts.info)} informativos`, inline: false },
      { name: '🌟 Reputação', value: rep ? `${rep.tier.emoji} ${rep.tier.name} — ${n(rep.score)} pontos` : 'Sem dados de reputação.', inline: false }
    );
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('mf:dashboard:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('mf:statistics').setLabel('Estatísticas').setEmoji('📈').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mf:economy').setLabel('Economia').setEmoji('💰').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mf:alerts').setLabel('Alertas').setEmoji('🔔').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('mf:warehouse').setLabel('Armazém').setEmoji('🏬').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mf:workforce').setLabel('Mão de obra').setEmoji('👷').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mf:research').setLabel('Pesquisa').setEmoji('🔬').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mf:contracts').setLabel('Contratos').setEmoji('📑').setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row1, row2] };
}

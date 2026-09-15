import { MessageFlags } from 'discord.js';
import { routeTicketFase14 } from '../interactions/routerFase14.js';
import { routeTicketFase13 } from '../interactions/routerFase13.js';
import { routeTicketFase12 } from '../interactions/routerFase12.js';
import { routeTicketFase11 } from '../interactions/routerFase11.js';
import { routeTicketFase10 } from '../interactions/routerFase10.js';
import { routeTicketFase9 } from '../interactions/routerFase9.js';
import { routeTicketFase8 } from '../interactions/routerFase8.js';
import { routeTicketFase7 } from '../interactions/routerFase7.js';
import { routeTicketFase6 } from '../interactions/routerFase6.js';

const routes = [routeTicketFase14,routeTicketFase13,routeTicketFase12,routeTicketFase11,routeTicketFase10,routeTicketFase9,routeTicketFase8,routeTicketFase7,routeTicketFase6];

export async function handleTicketSystem(interaction) {
  try {
    for (const route of routes) if (await route(interaction)) return true;
    return false;
  } catch (error) {
    console.error('[TICKETS] Erro de interação:', error);
    if (!interaction.isRepliable?.()) return true;
    const payload = { content: '❌ Ocorreu um erro ao executar esta ação do sistema de tickets.', flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => null);
    else await interaction.reply(payload).catch(() => null);
    return true;
  }
}

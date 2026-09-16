import { Events } from 'discord.js';
import { BOT_NAME } from '../config/settings.js';

// 🎁 Sorteios — Fases 1–10
import {
  giveawayScheduler
} from '../giveaways/GiveawayScheduler.js';

export default {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log('==========================================');
    console.log(`✅ ${BOT_NAME} conectado.`);
    console.log(`🤖 Bot: ${client.user.tag}`);
    console.log(`🆔 ID: ${client.user.id}`);
    console.log(`🌐 Servidores: ${client.guilds.cache.size}`);
    console.log(`⚡ Gateway: ${Math.round(client.ws.ping)} ms`);
    console.log('==========================================');

    // ==========================================
    // 🎁 SORTEIOS — SCHEDULER
    // ==========================================
    giveawayScheduler.start(client);

    console.log('🎁 Scheduler de sorteios iniciado.');
  }
};
import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica se o TNT está online.'),

  async execute(interaction) {
    const latency = Math.round(interaction.client.ws.ping);

    await interaction.reply({
      content: `🏓 Pong! Latência: \`${latency} ms\``,
      flags: MessageFlags.Ephemeral
    });
  }
};

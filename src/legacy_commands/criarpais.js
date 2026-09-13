import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CountryManager } from '../world/CountryManager.js';
const countries = new CountryManager();
export default {
  data: new SlashCommandBuilder().setName('criarpais').setDescription('Cria o país deste servidor.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((o) => o.setName('nome').setDescription('Nome do país').setRequired(true))
    .addStringOption((o) => o.setName('codigo').setDescription('Código de 2 a 5 caracteres').setRequired(true))
    .addStringOption((o) => o.setName('emoji').setDescription('Emoji/bandeira fictícia').setRequired(false)),
  async execute(i) { try { const c = countries.create({ guildId: i.guildId, guildName: i.guild?.name, leaderId: i.user.id, name: i.options.getString('nome'), code: i.options.getString('codigo'), emoji: i.options.getString('emoji') ?? '🏳️' }); await i.reply({ content: `✅ ${c.emoji} **${c.name}** (${c.code}) foi criado. Você é o líder.`, ephemeral: true }); } catch (e) { await i.reply({ content: `❌ ${e.message}`, ephemeral: true }); } }
};

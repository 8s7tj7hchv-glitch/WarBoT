import { ChannelType, PermissionFlagsBits, EmbedBuilder, MessageFlags } from 'discord.js';
import { nextTicketNumber, createTicketRecord, getOpenTicketsByUser } from '../database/ticketStore.js';
import { buildStaffControls } from '../interactions/staffPanel.js';

function cleanName(v='ticket') {
  return v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0, 60) || 'ticket';
}

export async function createTicketFromForm(interaction, cfg, category, answers = []) {
  const guild = interaction.guild;
  const user = interaction.user;
  if (!guild) throw new Error('Servidor não encontrado.');

  const globalLimit = Number(cfg.ticketLimit ?? cfg.limit ?? 1);
  const categoryLimit = Number(category.limit ?? globalLimit);
  const open = getOpenTicketsByUser(guild.id, user.id, category.key);
  if (open.length >= categoryLimit) {
    return interaction.reply({ content: `❌ Você já atingiu o limite de ${categoryLimit} ticket(s) nesta categoria.`, flags: MessageFlags.Ephemeral });
  }

  const number = nextTicketNumber(guild.id);
  const staffRoleId = category.staffRoleId || cfg.staffRoleId || cfg.supportRoleId;
  const parentId = category.discordCategoryId || cfg.ticketCategoryId || cfg.categoryId;

  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: user.id, allow: [
      PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.EmbedLinks
    ]},
  ];
  if (staffRoleId) overwrites.push({ id: staffRoleId, allow: [
    PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages
  ]});

  const channel = await guild.channels.create({
    name: `${cleanName(category.name || 'ticket')}-${String(number).padStart(4,'0')}`,
    type: ChannelType.GuildText,
    parent: parentId || undefined,
    topic: `Ticket #${number} | Usuário: ${user.id} | Categoria: ${category.name || category.key}`,
    permissionOverwrites: overwrites
  });

  const answerText = answers.length
    ? answers.map((a,i) => `**${i+1}. ${a.label}**\n${a.value || '*Não informado*'}`).join('\n\n')
    : '*Nenhum formulário configurado para esta categoria.*';

  const embed = new EmbedBuilder()
    .setTitle(`🎫 Ticket #${number}`)
    .setDescription(`Olá ${user}, seu ticket foi criado com sucesso.`)
    .addFields(
      { name: 'Categoria', value: `${category.emoji || '🎫'} ${category.name || 'Ticket'}`, inline: true },
      { name: 'Criado por', value: `${user}`, inline: true },
      { name: 'Respostas iniciais', value: answerText.slice(0, 1024) }
    )
    .setTimestamp();

  await channel.send({
    content: `${user}${staffRoleId ? ` <@&${staffRoleId}>` : ''}`,
    embeds: [embed],
    components: buildStaffControls()
  });

  createTicketRecord(guild.id, {
    number, channelId: channel.id, ownerId: user.id,
    categoryKey: category.key, categoryName: category.name,
    staffRoleId, claimedBy: null,
    status: 'open', createdAt: new Date().toISOString(),
    answers,
    history: [{ action: 'created', userId: user.id, at: new Date().toISOString() }]
  });

  await interaction.reply({ content: `✅ Ticket criado: ${channel}`, flags: MessageFlags.Ephemeral });
  return channel;
}

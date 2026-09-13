import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { EMBED_COLOR } from '../config/settings.js';
import { EconomyService } from '../economy/EconomyService.js';
import { renderPage } from './MainPanel.js';
import { renderUnifiedPanel, renderConfigPanel } from './UnifiedPanels.js';
import { openLegacyAction, submitLegacyModal } from './LegacyActionBridge.js';
import { GameChannelManager } from '../notifications/GameChannelManager.js';
import { NotificationManager } from '../notifications/NotificationManager.js';

const economy = new EconomyService();
const channels = new GameChannelManager();
const notifications = new NotificationManager({channels});
const selections = new Map();
const key = i => `${i.guildId ?? 'dm'}:${i.user.id}`;

function txEmbed(userId) {
  const LABELS={deposit:'🏦 Depósito',withdraw:'💵 Saque',transfer:'🔁 Transferência'};
  const history=economy.transactions.getUserHistory(userId,10);
  const lines=history.map(item=>{const label=LABELS[item.type]??`📄 ${item.type}`; const amount=Number(item.amount??0).toFixed(2); const date=new Date(item.created_at); const ts=Number.isNaN(date.getTime())?'':`<t:${Math.floor(date.getTime()/1000)}:R>`; const incoming=String(item.target_id??'')===String(userId)&&item.type==='transfer'; return `${item.type==='transfer'?(incoming?'⬇️':'⬆️'):'•'} **${label}** — $ ${amount} ${ts}`;});
  return new EmbedBuilder().setColor(EMBED_COLOR).setTitle('📜 Histórico de Transações').setDescription(lines.length?lines.join('\n'):'Nenhuma transação registrada ainda.');
}

export async function handleUnifiedUiInteraction(interaction) {
  if (interaction.isModalSubmit() && interaction.customId.startsWith('hub:legacy:')) return submitLegacyModal(interaction);

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId.startsWith('hub:action:')) {
      await openLegacyAction(interaction, interaction.values[0]);
      return true;
    }
    if (interaction.customId === 'hub:config:type') {
      const state=selections.get(key(interaction))??{}; state.type=interaction.values[0]; selections.set(key(interaction),state);
      await interaction.reply({content:`✅ Tipo selecionado: **${state.type}**. Agora escolha o canal e clique em **Salvar seleção**.`,ephemeral:true}); return true;
    }
  }

  if (interaction.isChannelSelectMenu?.() && interaction.customId === 'hub:config:channel') {
    const state=selections.get(key(interaction))??{}; state.channelId=interaction.values[0]; selections.set(key(interaction),state);
    await interaction.reply({content:`✅ Canal selecionado: <#${state.channelId}>. Clique em **Salvar seleção**.`,ephemeral:true}); return true;
  }

  if (!interaction.isButton()) return false;
  const id=interaction.customId;
  if (id.startsWith('hub:view:')) { await interaction.update(renderPage(id.split(':')[2],interaction.user)); return true; }
  if (id.startsWith('hub:panel:')) { await interaction.update(renderUnifiedPanel(id.split(':')[2],interaction.user,interaction.guildId)); return true; }
  if (id==='hub:economy:balance') { await interaction.update(renderUnifiedPanel('economia',interaction.user,interaction.guildId)); return true; }
  if (id==='hub:economy:transactions') { await interaction.reply({embeds:[txEmbed(interaction.user.id)],ephemeral:true}); return true; }
  if (id.startsWith('hub:config:')) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) { await interaction.reply({content:'❌ Você precisa da permissão **Gerenciar Servidor**.',ephemeral:true}); return true; }
    const action=id.split(':')[2];
    if(action==='refresh'){await interaction.update(renderConfigPanel(interaction.guildId)); return true;}
    const state=selections.get(key(interaction))??{};
    if(!state.type){await interaction.reply({content:'❌ Primeiro selecione o tipo de canal.',ephemeral:true}); return true;}
    if(action==='save'){
      if(!state.channelId){await interaction.reply({content:'❌ Escolha o canal antes de salvar.',ephemeral:true});return true;}
      channels.set(interaction.guildId,state.type,state.channelId); await interaction.reply({content:`✅ Canal **${state.type}** definido como <#${state.channelId}>.`,ephemeral:true}); return true;
    }
    if(action==='remove'){channels.remove(interaction.guildId,state.type); await interaction.reply({content:`✅ Configuração **${state.type}** removida.`,ephemeral:true}); return true;}
    if(action==='test'){const r=await notifications.send(interaction,interaction.guildId,state.type,{title:'Teste de notificações',emoji:'🧪',description:`Canal **${state.type}** configurado corretamente.`}); await interaction.reply({content:r.sent?'✅ Mensagem de teste enviada.':`❌ Não foi possível enviar: ${r.reason}`,ephemeral:true}); return true;}
  }
  return false;
}

import {giveawayManager} from '../GiveawayManager.js';
import {buildGiveawayMainPanel} from '../panels/GiveawayMainPanel.js';
import {buildCreateGiveawayModal} from '../modals/CreateGiveawayModal.js';
import {buildEditGiveawayModal} from '../modals/EditGiveawayModal.js';
import {buildManageSelector,buildManageActions} from '../panels/GiveawayManagePanel.js';
import {buildPublicGiveaway} from '../components/giveawayMessage.js';
import {parseDuration} from '../utils/duration.js';
import {validateGiveawayRequirements} from '../GiveawayValidator.js';
import {calculateEntries} from '../utils/entries.js';
import {buildRequirementsModal} from '../modals/GiveawayRequirementsModal.js';
import {buildEntriesModal} from '../modals/GiveawayEntriesModal.js';
import {buildRerollSelector,buildRerollActions} from '../panels/GiveawayRerollPanel.js';
import {buildScheduleGiveawayModal} from '../modals/ScheduleGiveawayModal.js';
import {buildScheduledPanel} from '../panels/GiveawayScheduledPanel.js';
import {parseStartDelay} from '../utils/schedule.js';
import {giveawayConfigStore} from '../GiveawayConfigStore.js';
import {canManageGiveaways} from '../GiveawayPermissions.js';
import {giveawayAuditLogger} from '../GiveawayAuditLogger.js';
import {buildLogsText} from '../panels/GiveawayLogsPanel.js';
import {buildConfigModal} from '../modals/GiveawayConfigModal.js';
import {buildTemplateModal} from '../modals/GiveawayTemplateModal.js';
import {buildTemplatePanel} from '../panels/GiveawayTemplatePanel.js';

async function refresh(interaction,g){
 try{
  const ch=await interaction.guild.channels.fetch(g.channelId);
  const msg=await ch?.messages.fetch(g.messageId);
  if(msg)await msg.edit(buildPublicGiveaway(g));
 }catch{}
}
const ids=raw=>raw.split(',').map(x=>x.trim()).filter(Boolean);
const validIds=a=>a.every(x=>/^\d{15,25}$/.test(x));

export async function handleGiveawaySystem(interaction){
 if(!interaction.customId?.startsWith('giveaway:'))return false;

 // Public participation
 if(interaction.customId.startsWith('giveaway:join:')){
  const id=interaction.customId.split(':')[2],g=await giveawayManager.get(id);
  if(!g||g.status!=='active'||Date.now()>=g.endsAt){await interaction.reply({content:'❌ Sorteio indisponível.',ephemeral:true});return true;}
  if(g.participants.includes(interaction.user.id)){await interaction.reply({content:'🎉 Você já está participando.',ephemeral:true});return true;}
  const member=await interaction.guild.members.fetch(interaction.user.id);
  const check=validateGiveawayRequirements(g,member);
  if(!check.allowed){await interaction.reply({content:`❌ Você não atende aos requisitos:\n${check.reasons.join('\n')}`,ephemeral:true});return true;}
  const entries=calculateEntries(g,member),participants=[...g.participants,interaction.user.id];
  const participantEntries={...(g.participantEntries||{}),[interaction.user.id]:entries};
  const updated=await giveawayManager.update(id,{participants,participantEntries});
  await refresh(interaction,updated);
  await giveawayAuditLogger.log({guildId:interaction.guildId,userId:interaction.user.id,giveawayId:id,action:'join'});
  await interaction.reply({content:`✅ Participação registrada com **${entries} entrada(s)**!`,ephemeral:true});return true;
 }
 if(interaction.customId.startsWith('giveaway:leave:')){
  const id=interaction.customId.split(':')[2],g=await giveawayManager.get(id);
  if(!g||g.status!=='active'){await interaction.reply({content:'❌ Sorteio indisponível.',ephemeral:true});return true;}
  if(!g.participants.includes(interaction.user.id)){await interaction.reply({content:'ℹ️ Você não está participando.',ephemeral:true});return true;}
  const participants=g.participants.filter(x=>x!==interaction.user.id),participantEntries={...(g.participantEntries||{})};
  delete participantEntries[interaction.user.id];
  const updated=await giveawayManager.update(id,{participants,participantEntries});await refresh(interaction,updated);
  await giveawayAuditLogger.log({guildId:interaction.guildId,userId:interaction.user.id,giveawayId:id,action:'leave'});
  await interaction.reply({content:'↩️ Sua participação foi removida.',ephemeral:true});return true;
 }

 if(!(await canManageGiveaways(interaction))){
  await interaction.reply({content:'⛔ Você não possui permissão para administrar sorteios.',ephemeral:true});return true;
 }

 if(interaction.customId==='giveaway:create'){await interaction.showModal(buildCreateGiveawayModal());return true;}
 if(interaction.customId==='giveaway:create:submit'){
  const durationMs=parseDuration(interaction.fields.getTextInputValue('duration')),winnerCount=Number(interaction.fields.getTextInputValue('winners'));
  if(!durationMs||!Number.isInteger(winnerCount)||winnerCount<1||winnerCount>20){await interaction.reply({content:'❌ Duração ou vencedores inválidos.',ephemeral:true});return true;}
  const c=await giveawayConfigStore.get(interaction.guildId);
  const channel=c.defaultChannelId?await interaction.guild.channels.fetch(c.defaultChannelId).catch(()=>null):interaction.channel;
  if(!channel?.isTextBased()){await interaction.reply({content:'❌ Canal inválido.',ephemeral:true});return true;}
  let g=await giveawayManager.create({guildId:interaction.guildId,creatorId:interaction.user.id,prize:interaction.fields.getTextInputValue('prize'),description:interaction.fields.getTextInputValue('description'),durationMs,winnerCount,channelId:channel.id});
  const msg=await channel.send({content:`${c.pingRoleId?`<@&${c.pingRoleId}> `:''}${c.defaultMessage||''}`.trim()||undefined,...buildPublicGiveaway(g)});
  g=await giveawayManager.update(g.id,{messageId:msg.id});
  await giveawayAuditLogger.log({guildId:interaction.guildId,userId:interaction.user.id,giveawayId:g.id,action:'create'});
  await interaction.reply({content:`✅ Sorteio criado em <#${channel.id}>.`,ephemeral:true});return true;
 }

 if(interaction.customId==='giveaway:manage'){await interaction.reply({...buildManageSelector(await giveawayManager.listByGuild(interaction.guildId)),ephemeral:true});return true;}
 if(interaction.customId==='giveaway:manage:select'){const g=await giveawayManager.get(interaction.values[0]);await interaction.update(buildManageActions(g));return true;}
 if(interaction.customId.startsWith('giveaway:edit:')&&!interaction.customId.startsWith('giveaway:edit:submit:')){const g=await giveawayManager.get(interaction.customId.split(':')[2]);await interaction.showModal(buildEditGiveawayModal(g));return true;}
 if(interaction.customId.startsWith('giveaway:edit:submit:')){
  const id=interaction.customId.split(':')[3],winnerCount=Number(interaction.fields.getTextInputValue('winners'));
  if(!Number.isInteger(winnerCount)||winnerCount<1||winnerCount>20){await interaction.reply({content:'❌ Vencedores: 1–20.',ephemeral:true});return true;}
  const g=await giveawayManager.update(id,{prize:interaction.fields.getTextInputValue('prize'),description:interaction.fields.getTextInputValue('description'),winnerCount});await refresh(interaction,g);
  await interaction.reply({content:'✅ Sorteio atualizado.',ephemeral:true});return true;
 }
 if(interaction.customId.startsWith('giveaway:end:')){const g=await giveawayManager.finish(interaction.customId.split(':')[2]);await refresh(interaction,g);await interaction.reply({content:'🏁 Sorteio encerrado.',ephemeral:true});return true;}
 if(interaction.customId.startsWith('giveaway:cancel:')){const g=await giveawayManager.cancel(interaction.customId.split(':')[2]);await refresh(interaction,g);await interaction.reply({content:'🚫 Sorteio cancelado.',ephemeral:true});return true;}
 if(interaction.customId.startsWith('giveaway:delete:')){await giveawayManager.remove(interaction.customId.split(':')[2]);await interaction.reply({content:'🗑️ Sorteio excluído do banco.',ephemeral:true});return true;}

 if(interaction.customId.startsWith('giveaway:req:submit:')){
  const id=interaction.customId.split(':')[3],requiredRoleIds=ids(interaction.fields.getTextInputValue('requiredRoles')),blockedRoleIds=ids(interaction.fields.getTextInputValue('blockedRoles'));
  const minAccountAgeDays=Number(interaction.fields.getTextInputValue('accountDays')||0),minServerAgeDays=Number(interaction.fields.getTextInputValue('serverDays')||0);
  if(!validIds([...requiredRoleIds,...blockedRoleIds])||![minAccountAgeDays,minServerAgeDays].every(x=>Number.isInteger(x)&&x>=0&&x<=3650)){await interaction.reply({content:'❌ Requisitos inválidos.',ephemeral:true});return true;}
  await giveawayManager.update(id,{requirements:{requiredRoleIds,blockedRoleIds,minAccountAgeDays,minServerAgeDays}});await interaction.reply({content:'✅ Requisitos atualizados.',ephemeral:true});return true;
 }
 if(interaction.customId.startsWith('giveaway:req:')){const g=await giveawayManager.get(interaction.customId.split(':')[2]);await interaction.showModal(buildRequirementsModal(g));return true;}

 if(interaction.customId.startsWith('giveaway:entries:submit:')){
  const id=interaction.customId.split(':')[3],raw=interaction.fields.getTextInputValue('roleBonuses').trim(),roleBonuses={};
  if(raw)for(const part of raw.split(',')){const [roleId,nRaw]=part.trim().split(':'),n=Number(nRaw);if(!/^\d{15,25}$/.test(roleId||'')||!Number.isInteger(n)||n<1||n>99){await interaction.reply({content:'❌ Use ID:EXTRAS.',ephemeral:true});return true;}roleBonuses[roleId]=n;}
  await giveawayManager.update(id,{entryConfig:{roleBonuses}});await interaction.reply({content:'✅ Entradas extras atualizadas.',ephemeral:true});return true;
 }
 if(interaction.customId.startsWith('giveaway:entries:')){const g=await giveawayManager.get(interaction.customId.split(':')[2]);await interaction.showModal(buildEntriesModal(g));return true;}

 if(interaction.customId==='giveaway:reroll'){const ended=(await giveawayManager.listByGuild(interaction.guildId)).filter(g=>g.status==='ended');await interaction.reply({...buildRerollSelector(ended),ephemeral:true});return true;}
 if(interaction.customId==='giveaway:reroll:select'){const g=await giveawayManager.get(interaction.values[0]);await interaction.update(buildRerollActions(g));return true;}
 if(interaction.customId.startsWith('giveaway:reroll:one:')){const r=await giveawayManager.rerollOne(interaction.customId.split(':')[3]);if(!r?.newWinner){await interaction.reply({content:'❌ Sem participante alternativo.',ephemeral:true});return true;}await refresh(interaction,r.giveaway);await interaction.update(buildRerollActions(r.giveaway));return true;}
 if(interaction.customId.startsWith('giveaway:reroll:all:')){const r=await giveawayManager.rerollAll(interaction.customId.split(':')[3]);if(!r?.newWinners?.length){await interaction.reply({content:'❌ Sem participantes alternativos.',ephemeral:true});return true;}await refresh(interaction,r.giveaway);await interaction.update(buildRerollActions(r.giveaway));return true;}
 if(interaction.customId.startsWith('giveaway:history:')){const g=await giveawayManager.get(interaction.customId.split(':')[2]),h=g?.rerollHistory||[];await interaction.reply({content:h.length?h.slice(-10).map(x=>`${x.type} • <t:${Math.floor(x.at/1000)}:R> • ${(x.newWinners||[]).map(v=>`<@${v}>`).join(', ')}`).join('\n'):'📭 Sem rerolls.',ephemeral:true});return true;}

 if(interaction.customId==='giveaway:schedule'){await interaction.showModal(buildScheduleGiveawayModal());return true;}
 if(interaction.customId==='giveaway:schedule:submit'){
  const startDelay=parseStartDelay(interaction.fields.getTextInputValue('startDelay')),durationMs=parseDuration(interaction.fields.getTextInputValue('duration')),winnerCount=Number(interaction.fields.getTextInputValue('winners'));
  if(!startDelay||!durationMs||!Number.isInteger(winnerCount)||winnerCount<1||winnerCount>20){await interaction.reply({content:'❌ Agendamento inválido.',ephemeral:true});return true;}
  const g=await giveawayManager.schedule({guildId:interaction.guildId,creatorId:interaction.user.id,prize:interaction.fields.getTextInputValue('prize'),description:interaction.fields.getTextInputValue('description'),channelId:interaction.channelId,winnerCount,durationMs,startsAt:Date.now()+startDelay});
  await interaction.reply({content:`✅ Agendado para <t:${Math.floor(g.startsAt/1000)}:F>.`,ephemeral:true});return true;
 }
 if(interaction.customId==='giveaway:scheduled'){const list=(await giveawayManager.listByGuild(interaction.guildId)).filter(g=>g.status==='scheduled');await interaction.reply({...buildScheduledPanel(list),ephemeral:true});return true;}
 if(interaction.customId==='giveaway:scheduled:select'){const id=interaction.values[0],g=await giveawayManager.update(id,{status:'cancelled',endedAt:Date.now()});await interaction.update({content:`🚫 Agendamento **${g.prize}** cancelado.`,components:[]});return true;}

 if(interaction.customId==='giveaway:config'){await interaction.showModal(buildConfigModal(await giveawayConfigStore.get(interaction.guildId)));return true;}
 if(interaction.customId==='giveaway:config:submit'){
  const get=x=>interaction.fields.getTextInputValue(x).trim()||null,defaultChannelId=get('channel'),adminRoleId=get('adminRole'),pingRoleId=get('pingRole');
  if(!validIds([defaultChannelId,adminRoleId,pingRoleId].filter(Boolean))){await interaction.reply({content:'❌ IDs inválidos.',ephemeral:true});return true;}
  await giveawayConfigStore.set(interaction.guildId,{defaultChannelId,adminRoleId,pingRoleId,defaultMessage:get('message')||'🎉 Novo sorteio!'});await interaction.reply({content:'✅ Configurações salvas.',ephemeral:true});return true;
 }
 if(interaction.customId==='giveaway:template:new'){await interaction.showModal(buildTemplateModal());return true;}
 if(interaction.customId==='giveaway:template:submit'){
  const name=interaction.fields.getTextInputValue('name').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'-'),duration=interaction.fields.getTextInputValue('duration'),winnerCount=Number(interaction.fields.getTextInputValue('winners'));
  if(!name||!parseDuration(duration)||!Number.isInteger(winnerCount)||winnerCount<1||winnerCount>20){await interaction.reply({content:'❌ Template inválido.',ephemeral:true});return true;}
  const c=await giveawayConfigStore.get(interaction.guildId);c.templates[name]={prize:interaction.fields.getTextInputValue('prize'),description:interaction.fields.getTextInputValue('description'),duration,winnerCount};await giveawayConfigStore.set(interaction.guildId,{templates:c.templates});await interaction.reply({content:`💾 Template **${name}** salvo.`,ephemeral:true});return true;
 }
 if(interaction.customId==='giveaway:templates'){const c=await giveawayConfigStore.get(interaction.guildId);await interaction.reply({...buildTemplatePanel(c.templates),ephemeral:true});return true;}
 if(interaction.customId==='giveaway:template:select'){
  const c=await giveawayConfigStore.get(interaction.guildId),t=c.templates[interaction.values[0]],channel=c.defaultChannelId?await interaction.guild.channels.fetch(c.defaultChannelId).catch(()=>null):interaction.channel;
  if(!t||!channel?.isTextBased()){await interaction.update({content:'❌ Template/canal inválido.',components:[]});return true;}
  let g=await giveawayManager.create({guildId:interaction.guildId,creatorId:interaction.user.id,prize:t.prize,description:t.description,durationMs:parseDuration(t.duration),winnerCount:t.winnerCount,channelId:channel.id});
  const msg=await channel.send(buildPublicGiveaway(g));g=await giveawayManager.update(g.id,{messageId:msg.id});await interaction.update({content:`✅ Criado em <#${channel.id}>.`,components:[]});return true;
 }
 if(interaction.customId==='giveaway:logs'){await interaction.reply({content:buildLogsText(await giveawayAuditLogger.guild(interaction.guildId,25)),ephemeral:true});return true;}
 return false;
}

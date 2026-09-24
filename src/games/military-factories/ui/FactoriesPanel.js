import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { FACTORIES } from '../core/FactoryRegistry.js';
import { factoryManager } from '../core/FactoryManager.js';
import { factoryMaintenanceManager } from '../maintenance/FactoryMaintenanceManager.js';

export function renderFactoriesPanel(userId){
 const owned=factoryManager.list(userId);
 const embed=new EmbedBuilder().setTitle('🏭 FÁBRICAS MILITARES').setDescription('Administre as 12 áreas industriais do jogo. Produção estratégica permanece fictícia e abstrata.').addFields(
  {name:'🏗️ Estrutura',value:`12 áreas disponíveis • ${owned.length} inicializadas`},
  {name:'🔗 Integração',value:'Produção concluída → entrega → Arsenal Nacional → Guerra Mundial'}
 );
 const select=new StringSelectMenuBuilder().setCustomId('mf:factory:select').setPlaceholder('Escolha uma fábrica').addOptions(FACTORIES.map(f=>({label:f.name.slice(0,100),value:f.id,emoji:f.emoji,description:`Destino: ${f.target}`.slice(0,100)})));
 const row1=new ActionRowBuilder().addComponents(select);
 const row2=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:dashboard').setLabel('Gestão geral').setEmoji('📊').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:queues').setLabel('Filas').setEmoji('⚙️').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:contracts').setLabel('Pedidos').setEmoji('📑').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:research').setLabel('Pesquisa').setEmoji('🔬').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:missions').setLabel('Missões').setEmoji('🎯').setStyle(ButtonStyle.Secondary)
 );
 const row3=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:achievements').setLabel('Conquistas').setEmoji('🏆').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:reputation').setLabel('Reputação').setEmoji('🌟').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:events').setLabel('Eventos').setEmoji('🌐').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:economy').setLabel('Economia').setEmoji('💰').setStyle(ButtonStyle.Secondary)
 );
 const row4=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:statistics').setLabel('Estatísticas').setEmoji('📈').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:alerts').setLabel('Alertas').setEmoji('🔔').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:planning').setLabel('Planejamento').setEmoji('📋').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:procurement').setLabel('Suprimentos').setEmoji('🛒').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary)
 );
 const row5=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('mf:warehouse').setLabel('Armazém').setEmoji('🏬').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:workforce').setLabel('Mão de obra').setEmoji('👷').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:training').setLabel('Treinamento').setEmoji('🎓').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:rewards').setLabel('Recompensas').setEmoji('🎁').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row1,row2,row3,row4,row5]};
}

export function renderFactoryDetail(userId,factoryId){
 const meta=FACTORIES.find(x=>x.id===factoryId); if(!meta) throw new Error('Fábrica inválida.');
 const f=factoryManager.ensure(userId,factoryId); const active=f.queue.filter(x=>x.status!=='completed'); const maintenance=factoryMaintenanceManager.status(userId,factoryId);
 const embed=new EmbedBuilder().setTitle(`${meta.emoji} ${meta.name}`).addFields(
  {name:'📈 Nível',value:String(f.level),inline:true},{name:'⚡ Eficiência',value:`${f.efficiency}%`,inline:true},{name:'📦 Capacidade da fila',value:String(f.capacity),inline:true},
  {name:'⚙️ Produções ativas',value:String(active.length),inline:true},{name:'✅ Concluídas',value:String(f.completed),inline:true},{name:'🛠️ Condição',value:`${maintenance.condition}%`,inline:true},{name:'🎯 Destino',value:meta.target,inline:true}
 );
 const row=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId(`mf:level:${factoryId}`).setLabel('Evoluir').setEmoji('⬆️').setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId(`mf:production:${factoryId}`).setLabel('Produção').setEmoji('⚙️').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId(`mf:maintain:${factoryId}`).setLabel('Manutenção').setEmoji('🛠️').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId(`mf:refresh:${factoryId}`).setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary)
 );
 const row2=new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId(`mf:upgrades:${factoryId}`).setLabel('Melhorias').setEmoji('🧩').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId(`mf:certification:${factoryId}`).setLabel('Certificação').setEmoji('🏅').setStyle(ButtonStyle.Secondary)
 );
 return {embeds:[embed],components:[row,row2]};
}

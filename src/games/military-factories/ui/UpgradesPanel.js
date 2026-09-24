import {ActionRowBuilder,ButtonBuilder,ButtonStyle,EmbedBuilder} from 'discord.js';
import {FACTORIES} from '../core/FactoryRegistry.js';
import {factoryUpgradeManager} from '../upgrades/FactoryUpgradeManager.js';
export function renderUpgradesPanel(userId,factoryId){
 const f=FACTORIES.find(x=>x.id===factoryId);if(!f)throw new Error('Fábrica inválida.');
 const state=factoryUpgradeManager.get(userId,factoryId);const catalog=factoryUpgradeManager.catalog();const bonuses=factoryUpgradeManager.bonuses(userId,factoryId);
 const embed=new EmbedBuilder().setTitle(`🧩 Melhorias — ${f.emoji} ${f.name}`).setDescription('Modernizações abstratas da fábrica. Cada melhoria possui 10 níveis.').addFields(
  ...catalog.map(x=>({name:`${x.emoji} ${x.name}`,value:`Nível ${state[x.id]}/${x.maxLevel}\n${x.description}`,inline:true})),
  {name:'📊 Bônus atuais',value:`Eficiência: +${bonuses.efficiencyBonus}%\nArmazenamento: +${bonuses.storageBonus}%\nEconomia de energia: ${bonuses.energyReduction}%\nQualidade: +${bonuses.qualityBonus}\nLogística: +${bonuses.logisticsBonus}%`}
 );
 const rows=[];for(let i=0;i<catalog.length;i+=5){rows.push(new ActionRowBuilder().addComponents(catalog.slice(i,i+5).map(x=>new ButtonBuilder().setCustomId(`mf:upgrade:${factoryId}:${x.id}`).setLabel(x.name.slice(0,80)).setEmoji(x.emoji).setStyle(ButtonStyle.Success))));}
 rows.push(new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`mf:refresh:${factoryId}`).setLabel('Voltar').setEmoji('↩️').setStyle(ButtonStyle.Secondary)));
 return {embeds:[embed],components:rows};
}

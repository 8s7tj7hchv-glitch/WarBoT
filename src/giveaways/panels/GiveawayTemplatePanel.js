import {ActionRowBuilder,StringSelectMenuBuilder} from 'discord.js';
export function buildTemplatePanel(templates){
 const entries=Object.entries(templates);
 if(!entries.length)return {content:'📭 Nenhum template salvo. Use **Salvar Template**.',components:[]};
 const menu=new StringSelectMenuBuilder().setCustomId('giveaway:template:select').setPlaceholder('Selecione um template')
 .addOptions(entries.slice(0,25).map(([name,t])=>({label:name.slice(0,100),value:name,description:`${t.prize} • ${t.duration} • ${t.winnerCount} vencedor(es)`.slice(0,100)})));
 return {content:'📋 **Templates de Sorteios**\nAo selecionar, o sorteio será publicado usando o template.',components:[new ActionRowBuilder().addComponents(menu)]};
}

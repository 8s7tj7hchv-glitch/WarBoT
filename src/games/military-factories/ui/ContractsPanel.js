import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { militaryContractManager } from '../contracts/MilitaryContractManager.js';
const LABEL={open:'🟡 Aberto',accepted:'🔵 Aceito',production:'⚙️ Produção',ready:'📦 Pronto',completed:'✅ Concluído',cancelled:'❌ Cancelado'};
export function renderContractsPanel(userId){
 const list=militaryContractManager.list(userId);const s=militaryContractManager.stats(userId);
 const text=list.length?list.slice(0,8).map(c=>`**${c.id}** • ${LABEL[c.status]||c.status}\n${c.factoryId} → ${c.itemId} × ${c.quantity}\n🏳️ Destino: ${c.countryId}`).join('\n\n'):'Nenhum pedido militar recebido.';
 const embed=new EmbedBuilder().setTitle('📑 PEDIDOS MILITARES').setDescription(text).addFields({name:'📊 Resumo',value:`Abertos: ${s.open} • Ativos: ${s.active} • Concluídos: ${s.completed}`},{name:'🔗 Fluxo',value:'Guerra Mundial → pedido → fábrica → produção → entrega → Arsenal Nacional'});
 const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('mf:contracts:refresh').setLabel('Atualizar').setEmoji('🔄').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId('mf:home').setLabel('Fábricas').setEmoji('🏭').setStyle(ButtonStyle.Secondary));
 return {embeds:[embed],components:[row]};
}

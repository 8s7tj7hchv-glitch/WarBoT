import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { NationalMilitaryProductionManager } from '../military_industry/NationalMilitaryProductionManager.js';
export default {
  data:new SlashCommandBuilder().setName('producaomilitarnacional').setDescription('Produz equipamento fictício usando a indústria nacional.').addStringOption(o=>o.setName('territorio').setDescription('ID do território industrial').setRequired(true)).addStringOption(o=>o.setName('receita').setDescription('ID da receita militar').setRequired(true)).addIntegerOption(o=>o.setName('quantidade').setDescription('Quantidade de lotes').setMinValue(1).setMaxValue(100).setRequired(true)),
  async execute(i){const [ok,msg,d]=new NationalMilitaryProductionManager().produce(i.user.id,i.options.getString('territorio'),i.options.getString('receita'),i.options.getInteger('quantidade'));await i.reply({content:`${ok?'✅':'❌'} ${msg}${d?`\nProduzido: **${d.item_id} ×${d.quantity}** • Q${d.quality}`:''}`,flags: MessageFlags.Ephemeral});}
};

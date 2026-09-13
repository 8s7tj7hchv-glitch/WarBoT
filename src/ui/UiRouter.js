import { ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle, MessageFlags } from 'discord.js';
import { renderPage } from './MainPanel.js';
import { EconomyService } from '../economy/EconomyService.js';
import { StorageTransferManager } from '../storage/StorageTransferManager.js';
import { ProductionManager } from '../production/ProductionManager.js';
import { MarketManager } from '../market/MarketManager.js';
import { InternationalMarketManager } from '../market/InternationalMarketManager.js';

const economy = new EconomyService();
const transfers = new StorageTransferManager();
const production = new ProductionManager();
const market = new MarketManager();
const internationalMarket = new InternationalMarketManager();

const row = (...components) => new ActionRowBuilder().addComponents(...components);
const input = (id, label, style = TextInputStyle.Short, placeholder = '') => new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(true).setPlaceholder(placeholder);

function modal(id, title, inputs) {
  return new ModalBuilder().setCustomId(id).setTitle(title).addComponents(...inputs.map(x => row(x)));
}

function normalizePageFromRefresh(customId) { return customId.split(':')[2] || 'home'; }

export async function handleUiInteraction(interaction) {
  if (interaction.isButton()) {
    const id = interaction.customId;
    if (id.startsWith('tnt:page:')) return interaction.update(renderPage(id.split(':')[2], interaction.user));
    if (id.startsWith('tnt:refresh:')) return interaction.update(renderPage(normalizePageFromRefresh(id), interaction.user));

    if (id === 'tnt:open:deposit') return interaction.showModal(modal('tnt:modal:deposit', 'Depositar no banco', [input('amount', 'Valor', TextInputStyle.Short, 'Ex.: 250')]));
    if (id === 'tnt:open:withdraw') return interaction.showModal(modal('tnt:modal:withdraw', 'Sacar do banco', [input('amount', 'Valor', TextInputStyle.Short, 'Ex.: 100')]));
    if (id === 'tnt:open:transfer') return interaction.showModal(modal('tnt:modal:transfer', 'Transferir dinheiro', [input('target', 'ID do jogador', TextInputStyle.Short, 'ID do Discord'), input('amount', 'Valor', TextInputStyle.Short, 'Ex.: 50')]));
    if (id === 'tnt:open:store') return interaction.showModal(modal('tnt:modal:store', 'Guardar item', [input('type', 'Destino', TextInputStyle.Short, 'warehouse, industrial ou garage'), input('item', 'ID do item', TextInputStyle.Short, 'Ex.: iron'), input('quantity', 'Quantidade', TextInputStyle.Short, 'Ex.: 10')]));
    if (id === 'tnt:open:retrieve') return interaction.showModal(modal('tnt:modal:retrieve', 'Retirar item', [input('type', 'Origem', TextInputStyle.Short, 'warehouse, industrial ou garage'), input('item', 'ID do item', TextInputStyle.Short, 'Ex.: iron'), input('quantity', 'Quantidade', TextInputStyle.Short, 'Ex.: 10')]));
    if (id.startsWith('tnt:open:produce:')) return interaction.showModal(modal(`tnt:modal:produce:${id.split(':')[3]}`, 'Produzir', [input('quantity', 'Quantidade de lotes', TextInputStyle.Short, 'Ex.: 1')]));
    if (id === 'tnt:open:marketSell') return interaction.showModal(modal('tnt:modal:marketSell', 'Criar ordem de venda', [input('item', 'ID do item', TextInputStyle.Short, 'Ex.: iron'), input('quantity', 'Quantidade', TextInputStyle.Short, 'Ex.: 25'), input('price', 'Preço unitário', TextInputStyle.Short, 'Ex.: 45.50')]));
    if (id === 'tnt:open:marketBuy') return interaction.showModal(modal('tnt:modal:marketBuy', 'Criar ordem de compra', [input('item', 'ID do item', TextInputStyle.Short, 'Ex.: iron'), input('quantity', 'Quantidade', TextInputStyle.Short, 'Ex.: 25'), input('price', 'Preço máximo unitário', TextInputStyle.Short, 'Ex.: 50')]));
    if (id === 'tnt:open:marketLookup') return interaction.showModal(modal('tnt:modal:marketLookup', 'Consultar item no mercado', [input('item', 'ID do item', TextInputStyle.Short, 'Ex.: iron')]));
    if (id === 'tnt:open:intSell') return interaction.showModal(modal('tnt:modal:intSell', 'Venda internacional', [input('item', 'ID do item', TextInputStyle.Short, 'Ex.: iron'), input('quantity', 'Quantidade', TextInputStyle.Short, 'Ex.: 25'), input('price', 'Preço unitário', TextInputStyle.Short, 'Ex.: 45.50')]));
    if (id === 'tnt:open:intBuy') return interaction.showModal(modal('tnt:modal:intBuy', 'Compra internacional', [input('item', 'ID do item', TextInputStyle.Short, 'Ex.: iron'), input('quantity', 'Quantidade', TextInputStyle.Short, 'Ex.: 25'), input('price', 'Preço máximo unitário', TextInputStyle.Short, 'Ex.: 50')]));
    return false;
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'tnt:select:storage') return interaction.update(renderPage('storage', interaction.user, interaction.values[0]));
    if (interaction.customId === 'tnt:select:recipe') return interaction.update(renderPage('production', interaction.user, interaction.values[0]));
    if (interaction.customId === 'tnt:select:profession') return interaction.update(renderPage('professions', interaction.user, interaction.values[0]));
    return false;
  }

  if (interaction.isModalSubmit()) {
    const id = interaction.customId;
    const uid = interaction.user.id;
    let ok = false, message = 'Operação não reconhecida.', page = 'home', arg = null;

    if (id === 'tnt:modal:deposit') { [ok, message] = economy.deposit(uid, interaction.fields.getTextInputValue('amount')); page = 'economy'; }
    else if (id === 'tnt:modal:withdraw') { [ok, message] = economy.withdraw(uid, interaction.fields.getTextInputValue('amount')); page = 'economy'; }
    else if (id === 'tnt:modal:transfer') { [ok, message] = economy.transfer(uid, interaction.fields.getTextInputValue('target').replace(/\D/g, ''), interaction.fields.getTextInputValue('amount')); page = 'economy'; }
    else if (id === 'tnt:modal:store') { [ok, message] = transfers.inventoryToStorage(uid, interaction.fields.getTextInputValue('type').trim().toLowerCase(), interaction.fields.getTextInputValue('item').trim(), interaction.fields.getTextInputValue('quantity')); page = 'inventory'; }
    else if (id === 'tnt:modal:retrieve') { const type = interaction.fields.getTextInputValue('type').trim().toLowerCase(); [ok, message] = transfers.storageToInventory(uid, type, interaction.fields.getTextInputValue('item').trim(), interaction.fields.getTextInputValue('quantity')); page = 'storage'; arg = type; }
    else if (id.startsWith('tnt:modal:produce:')) { const recipeId = id.split(':')[3]; [ok, message] = production.craft(uid, recipeId, interaction.fields.getTextInputValue('quantity')); page = 'production'; arg = recipeId; }
    else if (id === 'tnt:modal:marketSell') { [ok, message] = market.createSellOrder(uid, interaction.fields.getTextInputValue('item').trim(), interaction.fields.getTextInputValue('quantity'), interaction.fields.getTextInputValue('price')); page = 'market'; }
    else if (id === 'tnt:modal:marketBuy') { [ok, message] = market.createBuyOrder(uid, interaction.fields.getTextInputValue('item').trim(), interaction.fields.getTextInputValue('quantity'), interaction.fields.getTextInputValue('price')); page = 'market'; }
    else if (id === 'tnt:modal:marketLookup') { ok = true; message = 'Consulta atualizada.'; page = 'market'; arg = interaction.fields.getTextInputValue('item').trim(); }
    else if (id === 'tnt:modal:intSell') { [ok, message] = internationalMarket.createSellOrder(uid, interaction.guildId, interaction.guild?.name ?? 'Servidor', interaction.fields.getTextInputValue('item').trim(), interaction.fields.getTextInputValue('quantity'), interaction.fields.getTextInputValue('price')); page = 'market'; }
    else if (id === 'tnt:modal:intBuy') { [ok, message] = internationalMarket.createBuyOrder(uid, interaction.guildId, interaction.guild?.name ?? 'Servidor', interaction.fields.getTextInputValue('item').trim(), interaction.fields.getTextInputValue('quantity'), interaction.fields.getTextInputValue('price')); page = 'market'; }
    else return false;

    await interaction.reply({ content: `${ok ? '✅' : '❌'} ${message}`, flags: MessageFlags.Ephemeral });
    await interaction.followUp({ ...renderPage(page, interaction.user, arg), flags: MessageFlags.Ephemeral });
    return true;
  }

  return false;
}

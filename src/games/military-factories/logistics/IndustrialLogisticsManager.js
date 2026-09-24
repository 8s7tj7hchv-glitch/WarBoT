import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.TNT_DATA_DIR || './data';
const FILE = path.join(DATA_DIR, 'military-factories', 'shipments.json');

function readData() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return { shipments: [] }; }
}
function writeData(data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export class IndustrialLogisticsManager {
  createShipment({ playerId, guildId, countryId, items = [], source = 'industrial_stock', destination = 'national_arsenal' }) {
    if (!playerId || !guildId || !countryId) throw new Error('playerId, guildId e countryId são obrigatórios.');
    if (!Array.isArray(items) || !items.length) throw new Error('A entrega precisa possuir itens.');
    const data = readData();
    const now = Date.now();
    const shipment = {
      id: `SHP-${now.toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      playerId: String(playerId), guildId: String(guildId), countryId: String(countryId),
      source, destination,
      items: items.map(x => ({ itemId: String(x.itemId), quantity: Math.max(1, Number(x.quantity) || 1), quality: Number(x.quality) || 100 })),
      status: 'prepared', progress: 0, createdAt: now, updatedAt: now, deliveredAt: null
    };
    data.shipments.push(shipment); writeData(data); return shipment;
  }

  list({ playerId, guildId, status } = {}) {
    return readData().shipments.filter(s => (!playerId || s.playerId === String(playerId)) && (!guildId || s.guildId === String(guildId)) && (!status || s.status === status));
  }

  get(id) { return readData().shipments.find(s => s.id === id) || null; }

  advance(id, amount = 25) {
    const data = readData(); const s = data.shipments.find(x => x.id === id);
    if (!s) throw new Error('Entrega não encontrada.');
    if (s.status === 'delivered' || s.status === 'cancelled') return s;
    s.status = 'in_transit'; s.progress = Math.min(100, s.progress + Math.max(1, Number(amount) || 25)); s.updatedAt = Date.now();
    if (s.progress >= 100) { s.status = 'arrived'; s.progress = 100; }
    writeData(data); return s;
  }

  markDelivered(id) {
    const data = readData(); const s = data.shipments.find(x => x.id === id);
    if (!s) throw new Error('Entrega não encontrada.');
    if (s.status !== 'arrived') throw new Error('A entrega ainda não chegou ao destino.');
    s.status = 'delivered'; s.deliveredAt = Date.now(); s.updatedAt = s.deliveredAt; writeData(data); return s;
  }

  cancel(id) {
    const data = readData(); const s = data.shipments.find(x => x.id === id);
    if (!s) throw new Error('Entrega não encontrada.');
    if (s.status === 'delivered') throw new Error('Entrega já concluída.');
    s.status = 'cancelled'; s.updatedAt = Date.now(); writeData(data); return s;
  }
}

import { IndustrialLogisticsManager } from './IndustrialLogisticsManager.js';

export class LogisticsService {
  constructor({ deliveryService = null } = {}) {
    this.shipments = new IndustrialLogisticsManager();
    this.deliveryService = deliveryService;
  }

  prepare(payload) { return this.shipments.createShipment(payload); }
  advance(shipmentId, amount = 25) { return this.shipments.advance(shipmentId, amount); }

  async deliver(shipmentId) {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) throw new Error('Entrega não encontrada.');
    if (shipment.status !== 'arrived') throw new Error('A carga ainda não chegou.');
    if (this.deliveryService?.deliverShipment) await this.deliveryService.deliverShipment(shipment);
    return this.shipments.markDelivered(shipmentId);
  }
}

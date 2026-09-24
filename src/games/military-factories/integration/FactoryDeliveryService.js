// Ponte abstrata: Fábricas -> Arsenal Nacional da Guerra Mundial.
export class FactoryDeliveryService {
 constructor({ arsenalService }={}){ this.arsenalService=arsenalService; }
 async deliver({guildId,countryId,itemId,quantity,sourceFactory}){
  const payload={guildId,countryId,itemId,quantity,sourceFactory,deliveredAt:new Date().toISOString()};
  if(this.arsenalService?.receive) await this.arsenalService.receive(payload);
  return payload;
 }
}

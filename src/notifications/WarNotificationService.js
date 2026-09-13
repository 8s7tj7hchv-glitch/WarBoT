import { NotificationManager } from './NotificationManager.js';
import { CountryManager } from '../world/CountryManager.js';
import { TerritoryManager } from '../world/TerritoryManager.js';

export class WarNotificationService {
  constructor({notifications=new NotificationManager(),countries=new CountryManager(),territories=new TerritoryManager()}={}){this.notifications=notifications;this.countries=countries;this.territories=territories;}
  async battle(interaction,battle){
    if(!interaction.guildId||!battle)return;
    const atk=this.countries.get(battle.attacker_country_id), def=this.countries.get(battle.defender_country_id), target=this.territories.get(battle.target_territory_id);
    return this.notifications.send(interaction,interaction.guildId,'war',{
      title:'Alerta de batalha',emoji:'🚨',description:battle.territory_conquered?'🏳️ O controle territorial mudou após a batalha.':'🛡️ O controle territorial foi mantido.',
      fields:[
        {name:'Atacante',value:`${atk?.emoji??'🏳️'} ${atk?.name??battle.attacker_country_id}`,inline:true},
        {name:'Defensor',value:`${def?.emoji??'🏳️'} ${def?.name??battle.defender_country_id}`,inline:true},
        {name:'Território',value:target?.name??battle.target_territory_id,inline:true},
        {name:'Resultado',value:`${battle.attacker_score} × ${battle.defender_score}`,inline:true},
        {name:'Vencedor',value:this.countries.get(battle.winner_country_id)?.name??battle.winner_country_id,inline:true},
        {name:'Batalha',value:`\`${battle.id}\``,inline:true}
      ]
    });
  }
}

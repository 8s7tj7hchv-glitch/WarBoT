import { NotificationManager } from './NotificationManager.js';
export class WorldNotificationService{
 constructor({notifications=new NotificationManager()}={}){this.notifications=notifications;}
 async event(interaction,event){if(!interaction.guildId||!event)return;return this.notifications.send(interaction,interaction.guildId,'world',{title:event.name??'Evento mundial',emoji:event.emoji??'🌐',description:event.description??'Novo evento mundial do jogo.',fields:[{name:'Duração',value:event.expires_at?`até <t:${Math.floor(Date.parse(event.expires_at)/1000)}:R>`:'—'}]});}
}

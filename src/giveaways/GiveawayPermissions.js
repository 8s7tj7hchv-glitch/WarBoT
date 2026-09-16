import {PermissionFlagsBits} from 'discord.js';
import {giveawayConfigStore} from './GiveawayConfigStore.js';

export async function canManageGiveaways(interaction){
 if(!interaction.inGuild())return false;
 if(interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild))return true;
 const c=await giveawayConfigStore.get(interaction.guildId);
 return Boolean(c.adminRoleId && interaction.member?.roles?.cache?.has(c.adminRoleId));
}

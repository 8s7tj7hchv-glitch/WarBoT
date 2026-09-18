import { SlashCommandBuilder } from 'discord.js';
import { renderGlobalProfile } from '../ui/ProfilePanel.js';
export default {data:new SlashCommandBuilder().setName('perfil').setDescription('Mostra seu perfil global e Game ID.'),async execute(interaction){await interaction.reply({...renderGlobalProfile(interaction),ephemeral:true});}};

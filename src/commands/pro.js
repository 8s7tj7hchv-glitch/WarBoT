import {SlashCommandBuilder} from 'discord.js';import {renderProPanel} from '../ui/ProPanel.js';
export default{data:new SlashCommandBuilder().setName('pro').setDescription('Abre a Central Pro Player.'),async execute(interaction){await interaction.reply({...renderProPanel(interaction.user),ephemeral:true});}};

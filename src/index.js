import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Client,
  Collection,
  GatewayIntentBits
} from 'discord.js';

import {
  BOT_NAME,
  BOT_TOKEN
} from './config/settings.js';

import { createDirectories } from './core/directories.js';
import { loadCommands } from './core/loadCommands.js';
import { loadEvents } from './core/loadEvents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!BOT_TOKEN) {
  throw new Error(
    '❌ BOT_TOKEN não encontrado. Crie o arquivo .env e adicione BOT_TOKEN=...'
  );
}

console.log('==========================================');
console.log(`🚀 Iniciando ${BOT_NAME} em Node.js...`);
console.log('==========================================');

createDirectories();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

const commandsDirectory = path.join(__dirname, 'commands');
const eventsDirectory = path.join(__dirname, 'events');

const applicationCommands = await loadCommands(
  client,
  commandsDirectory
);

await loadEvents(
  client,
  eventsDirectory
);

await client.login(BOT_TOKEN);

// Sincroniza os slash commands globais após o login.
// Registro global de comandos após o login; não exige CLIENT_ID separado.
try {
  await client.application.commands.set(applicationCommands);
  console.log(`✅ ${applicationCommands.length} comando(s) slash sincronizado(s).`);
} catch (error) {
  console.error('❌ Erro ao sincronizar comandos slash:', error);
}

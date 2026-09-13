import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadCommands(client, commandsDirectory) {
  const files = fs
    .readdirSync(commandsDirectory)
    .filter((file) => file.endsWith('.js'));

  const applicationCommands = [];

  for (const file of files) {
    const filePath = path.join(commandsDirectory, file);
    const module = await import(pathToFileURL(filePath).href);
    const command = module.default ?? ((module.data && typeof module.execute === 'function') ? { data: module.data, execute: module.execute } : null);

    if (!command?.data || typeof command.execute !== 'function') {
      console.warn(`⚠️ Comando ignorado: ${file}`);
      continue;
    }

    client.commands.set(command.data.name, command);
    applicationCommands.push(command.data.toJSON());
    console.log(`✅ Comando carregado: /${command.data.name}`);
  }

  return applicationCommands;
}

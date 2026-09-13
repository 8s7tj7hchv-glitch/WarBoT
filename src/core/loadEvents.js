import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadEvents(client, eventsDirectory) {
  const files = fs
    .readdirSync(eventsDirectory)
    .filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(eventsDirectory, file);
    const module = await import(pathToFileURL(filePath).href);
    const event = module.default;

    if (!event?.name || typeof event.execute !== 'function') {
      console.warn(`⚠️ Evento ignorado: ${file}`);
      continue;
    }

    const handler = (...args) => event.execute(...args, client);

    if (event.once) {
      client.once(event.name, handler);
    } else {
      client.on(event.name, handler);
    }

    console.log(`✅ Evento carregado: ${event.name}`);
  }
}

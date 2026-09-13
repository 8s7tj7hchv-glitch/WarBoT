import fs from 'node:fs';
import { DIRECTORIES } from '../config/settings.js';

export function createDirectories() {
  for (const directory of DIRECTORIES) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

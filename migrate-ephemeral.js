import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('src');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      files.push(...walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

function addMessageFlagsImport(code) {
  if (code.includes('MessageFlags')) {
    return code;
  }

  const namedImportRegex =
    /import\s*\{([\s\S]*?)\}\s*from\s*['"]discord\.js['"];?/m;

  const match = code.match(namedImportRegex);

  if (match) {
    const currentImports = match[1].trim();

    const replacement = `import {
${currentImports ? `  ${currentImports.replace(/\n/g, '\n  ')},\n` : ''}  MessageFlags
} from 'discord.js';`;

    return code.replace(namedImportRegex, replacement);
  }

  const defaultOrOtherDiscordImportRegex =
    /import\s+(.+?)\s+from\s+['"]discord\.js['"];?/m;

  if (defaultOrOtherDiscordImportRegex.test(code)) {
    return code.replace(
      defaultOrOtherDiscordImportRegex,
      match => `${match}\nimport { MessageFlags } from 'discord.js';`
    );
  }

  return `import { MessageFlags } from 'discord.js';\n${code}`;
}

const files = walk(ROOT);

let changedFiles = 0;
let replacements = 0;

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  if (!/ephemeral\s*:\s*true/.test(code)) {
    continue;
  }

  const occurrences =
    code.match(/ephemeral\s*:\s*true/g)?.length ?? 0;

  code = code.replace(
    /ephemeral\s*:\s*true/g,
    'flags: MessageFlags.Ephemeral'
  );

  code = addMessageFlagsImport(code);

  fs.writeFileSync(file, code, 'utf8');

  changedFiles++;
  replacements += occurrences;

  console.log(`✅ ${path.relative(process.cwd(), file)} — ${occurrences} alteração(ões)`);
}

console.log('');
console.log(`✅ Arquivos alterados: ${changedFiles}`);
console.log(`✅ Ocorrências substituídas: ${replacements}`);
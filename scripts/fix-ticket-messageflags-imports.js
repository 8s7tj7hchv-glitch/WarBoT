import fs from 'node:fs';
import path from 'node:path';

const TARGETS = [
  path.resolve('src/tickets'),
  path.resolve('src/commands/ticket')
];

let analisados = 0;
let corrigidos = 0;
let jaCorretos = 0;
let erros = 0;

function getFiles(target) {
  if (!fs.existsSync(target)) return [];

  const stat = fs.statSync(target);

  if (stat.isFile()) {
    return target.endsWith('.js') ? [target] : [];
  }

  const files = [];

  for (const item of fs.readdirSync(target)) {
    files.push(...getFiles(path.join(target, item)));
  }

  return files;
}

function possuiImportMessageFlags(code) {
  const regex =
    /import\s*\{[\s\S]*?\bMessageFlags\b[\s\S]*?\}\s*from\s*['"]discord\.js['"]/;

  return regex.test(code);
}

function corrigirArquivo(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Só interessa arquivo que realmente usa MessageFlags
  if (!code.includes('MessageFlags.Ephemeral')) {
    return;
  }

  analisados++;

  if (possuiImportMessageFlags(code)) {
    jaCorretos++;
    console.log(
      `✅ Já correto: ${path.relative(process.cwd(), filePath)}`
    );
    return;
  }

  // ==========================================
  // CASO 1
  // Já existe import { ... } from 'discord.js'
  // ==========================================
  const namedImport =
    /import\s*\{([\s\S]*?)\}\s*from\s*(['"])discord\.js\2\s*;?/;

  const match = code.match(namedImport);

  if (match) {
    const imports = match[1]
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    if (!imports.includes('MessageFlags')) {
      imports.push('MessageFlags');
    }

    const quote = match[2];

    const replacement =
      `import {\n  ${imports.join(',\n  ')}\n} from ${quote}discord.js${quote};`;

    code = code.replace(namedImport, replacement);

    fs.writeFileSync(filePath, code, 'utf8');

    corrigidos++;

    console.log(
      `🔧 Import corrigido: ${path.relative(process.cwd(), filePath)}`
    );

    return;
  }

  // ==========================================
  // CASO 2
  // Arquivo não tinha import nomeado discord.js
  // ==========================================

  code =
    `import { MessageFlags } from 'discord.js';\n` +
    code;

  fs.writeFileSync(filePath, code, 'utf8');

  corrigidos++;

  console.log(
    `🔧 Import criado: ${path.relative(process.cwd(), filePath)}`
  );
}

console.log('');
console.log('==========================================');
console.log('🎫 MESSAGEFLAGS — CORREÇÃO DE IMPORTS');
console.log('==========================================');

for (const target of TARGETS) {
  if (!fs.existsSync(target)) {
    console.log(
      `⚠️ Caminho não encontrado: ${path.relative(process.cwd(), target)}`
    );
    continue;
  }

  const files = getFiles(target);

  for (const file of files) {
    try {
      corrigirArquivo(file);
    } catch (error) {
      erros++;

      console.error(
        `❌ Erro: ${path.relative(process.cwd(), file)}`,
        error.message
      );
    }
  }
}

console.log('');
console.log('==========================================');
console.log(`🔎 Arquivos com MessageFlags: ${analisados}`);
console.log(`🔧 Imports corrigidos: ${corrigidos}`);
console.log(`✅ Já estavam corretos: ${jaCorretos}`);
console.log(`❌ Erros: ${erros}`);
console.log('==========================================');

if (erros === 0) {
  console.log('✅ Correção de imports concluída.');
} else {
  console.log('⚠️ Alguns arquivos precisam ser verificados.');
}
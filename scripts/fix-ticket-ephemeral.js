import fs from 'node:fs';
import path from 'node:path';

const TARGETS = [
  path.resolve('src/tickets'),
  path.resolve('src/commands/ticket.js')
];

let arquivosAlterados = 0;
let substituicoes = 0;

function processarArquivo(filePath) {
  if (!filePath.endsWith('.js')) return;

  let code = fs.readFileSync(filePath, 'utf8');

  if (!code.includes('ephemeral: true')) {
    return;
  }

  const original = code;

  // 1. Troca ephemeral: true
  const matches = code.match(/ephemeral\s*:\s*true/g);

  if (matches) {
    substituicoes += matches.length;

    code = code.replace(
      /ephemeral\s*:\s*true/g,
      'flags: MessageFlags.Ephemeral'
    );
  }

  // 2. Adiciona MessageFlags ao import do discord.js
  if (
    code.includes('MessageFlags.Ephemeral') &&
    !temImportMessageFlags(code)
  ) {
    code = adicionarMessageFlags(code);
  }

  if (code !== original) {
    fs.writeFileSync(filePath, code, 'utf8');

    arquivosAlterados++;

    console.log(
      `✅ Atualizado: ${path.relative(process.cwd(), filePath)}`
    );
  }
}

function temImportMessageFlags(code) {
  const imports = code.match(
    /import\s*\{[\s\S]*?\}\s*from\s*['"]discord\.js['"];?/g
  );

  if (!imports) return false;

  return imports.some(importLine =>
    /\bMessageFlags\b/.test(importLine)
  );
}

function adicionarMessageFlags(code) {
  const regex =
    /import\s*\{([\s\S]*?)\}\s*from\s*(['"])discord\.js\2;?/;

  const match = code.match(regex);

  if (!match) {
    console.warn(
      '⚠️ Não encontrei import { ... } from discord.js'
    );

    return code;
  }

  const imports = match[1]
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  if (!imports.includes('MessageFlags')) {
    imports.push('MessageFlags');
  }

  const novoImport =
    `import { ${imports.join(', ')} } from ${match[2]}discord.js${match[2]};`;

  return code.replace(regex, novoImport);
}

function percorrer(target) {
  if (!fs.existsSync(target)) {
    console.warn(
      `⚠️ Não encontrado: ${path.relative(process.cwd(), target)}`
    );

    return;
  }

  const stat = fs.statSync(target);

  if (stat.isFile()) {
    processarArquivo(target);
    return;
  }

  for (const item of fs.readdirSync(target)) {
    const fullPath = path.join(target, item);

    const itemStat = fs.statSync(fullPath);

    if (itemStat.isDirectory()) {
      percorrer(fullPath);
    } else {
      processarArquivo(fullPath);
    }
  }
}

console.log('======================================');
console.log('🎫 CORREÇÃO EPHEMERAL — TICKETS');
console.log('======================================');

for (const target of TARGETS) {
  percorrer(target);
}

console.log('');
console.log('======================================');
console.log(`📁 Arquivos alterados: ${arquivosAlterados}`);
console.log(`🔧 Substituições: ${substituicoes}`);
console.log('======================================');

if (substituicoes === 0) {
  console.log('✅ Nenhum ephemeral: true encontrado.');
} else {
  console.log('✅ Atualização concluída.');
}
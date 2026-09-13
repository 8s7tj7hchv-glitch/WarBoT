import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const roots = [path.join(root, 'src'), path.join(root, 'scripts')];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : (entry.isFile() && full.endsWith('.js') ? [full] : []);
  });
}

const files = roots.flatMap(walk);
const errors = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) errors.push(`${path.relative(root, file)}\n${result.stderr || result.stdout}`);

  const source = fs.readFileSync(file, 'utf8');
  const importRegex = /from\s+['\"]([^'\"]+)['\"]/g;
  for (const match of source.matchAll(importRegex)) {
    const spec = match[1];
    if (!spec.startsWith('.')) continue;
    let target = path.resolve(path.dirname(file), spec);
    if (!path.extname(target)) target += '.js';
    if (!fs.existsSync(target)) errors.push(`${path.relative(root, file)} -> import ausente: ${spec}`);
  }
}

if (errors.length) {
  console.error(`❌ ${errors.length} problema(s) encontrado(s):`);
  console.error(errors.join('\n\n'));
  process.exit(1);
}

console.log(`✅ ${files.length} arquivo(s) JavaScript verificados; imports relativos resolvidos.`);

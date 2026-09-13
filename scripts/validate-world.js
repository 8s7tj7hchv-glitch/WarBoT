import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = process.env.TNT_DATA_DIR ? path.resolve(process.env.TNT_DATA_DIR, 'world') : path.resolve(__dirname, '../data/world');
const territories = JSON.parse(fs.readFileSync(path.join(dir, 'territories.json'), 'utf8'));
const borders = JSON.parse(fs.readFileSync(path.join(dir, 'borders.json'), 'utf8'));
const ids = new Set(territories.map((t) => t.id));
const errors = [];
for (const t of territories) {
  if (!t.id || !t.name) errors.push('Território sem id/nome');
  if (!borders[t.id]) errors.push(`Sem fronteiras: ${t.id}`);
}
for (const [a, ns] of Object.entries(borders)) {
  if (!ids.has(a)) errors.push(`Fronteira origem inválida: ${a}`);
  for (const b of ns) {
    if (!ids.has(b)) errors.push(`Fronteira destino inválida: ${b}`);
    if (!(borders[b] ?? []).includes(a)) errors.push(`Fronteira não simétrica: ${a}<->${b}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`✅ Mundo válido: ${territories.length} territórios e ${Object.values(borders).reduce((s, x) => s + x.length, 0) / 2} fronteiras.`);

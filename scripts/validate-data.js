import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'data');
const errors = [];
let jsonCount = 0;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

for (const file of walk(dataDir).filter((f) => f.endsWith('.json'))) {
  jsonCount += 1;
  try { JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { errors.push(`${path.relative(root, file)}: JSON inválido (${error.message})`); }
}

function readObject(file) {
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

const items = {};
for (const folder of ['resources', 'products']) {
  const dir = path.join(dataDir, folder);
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.json'))) {
    Object.assign(items, readObject(path.join(dir, file)));
  }
}

const productionDir = path.join(dataDir, 'production');
for (const file of fs.readdirSync(productionDir).filter((name) => name.endsWith('_recipes.json'))) {
  const recipes = readObject(path.join(productionDir, file));
  for (const [recipeId, recipe] of Object.entries(recipes)) {
    for (const itemId of Object.keys(recipe.inputs ?? {})) {
      if (!(itemId in items)) errors.push(`Receita ${recipeId}: input desconhecido ${itemId}`);
    }
    const outputId = recipe.output?.item_id;
    if (outputId && !(outputId in items)) errors.push(`Receita ${recipeId}: output desconhecido ${outputId}`);
  }
}

if (errors.length) {
  console.error(`❌ ${errors.length} problema(s) de dados:`);
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`✅ ${jsonCount} JSON válido(s); ${Object.keys(items).length} item(ns); receitas sem referências quebradas.`);

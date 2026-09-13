import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const tech = read('data/military_industry/technology_tree.json');
const defs = read('data/military_industry/complex_definitions.json');
const recipes = read('data/production/military_recipes.json');
const facilities = read('data/industrial/facilities.json');
const items = {};
for (const folder of ['resources', 'products']) {
  for (const name of fs.readdirSync(path.join(root, 'data', folder)).filter((x) => x.endsWith('.json'))) Object.assign(items, read(`data/${folder}/${name}`));
}
const errors = [];
const techIds = new Set(Object.keys(tech));
const recipeIds = new Set(Object.keys(recipes));
const facilityIds = new Set(Object.keys(facilities));

for (const [id, t] of Object.entries(tech)) {
  if (!t.name) errors.push(`${id}: nome ausente`);
  if (!Number.isFinite(Number(t.cost)) || Number(t.cost) < 0) errors.push(`${id}: custo de pesquisa inválido`);
  for (const pre of t.prerequisites ?? []) if (!techIds.has(String(pre))) errors.push(`${id}: pré-requisito desconhecido ${pre}`);
  for (const recipe of t.unlocks_recipes ?? []) if (!recipeIds.has(String(recipe))) errors.push(`${id}: receita desconhecida ${recipe}`);
  for (const facility of t.unlocks_facilities ?? []) if (!facilityIds.has(String(facility))) errors.push(`${id}: instalação desconhecida ${facility}`);
}
for (const [id, d] of Object.entries(defs)) {
  if (!d.name) errors.push(`${id}: nome ausente`);
  if (d.facility && !facilityIds.has(String(d.facility))) errors.push(`${id}: facility desconhecida ${d.facility}`);
  if (d.required_technology && !techIds.has(String(d.required_technology))) errors.push(`${id}: tecnologia desconhecida ${d.required_technology}`);
}
for (const [id, r] of Object.entries(recipes)) {
  if (!items[r.output?.item_id]) errors.push(`${id}: output desconhecido ${r.output?.item_id}`);
  for (const input of Object.keys(r.inputs ?? {})) if (!items[input]) errors.push(`${id}: input desconhecido ${input}`);
  const unlocked = Object.values(tech).some((t) => (t.unlocks_recipes ?? []).includes(id));
  if (!unlocked) errors.push(`${id}: receita não é desbloqueada por nenhuma tecnologia`);
}

if (errors.length) {
  console.error(`❌ ${errors.length} problema(s) na Fase 6:\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`✅ Indústria militar válida: ${Object.keys(defs).length} complexos, ${Object.keys(tech).length} tecnologias e ${Object.keys(recipes).length} receitas fictícias integradas.`);

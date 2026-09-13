import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const catalog=read('data/military/unit_catalog.json');
const territories=read('data/world/territories.json');
const branches=new Set(['army','air_force','navy','strategic']);
const errors=[];
for(const [id,u] of Object.entries(catalog)){if(!u.name)errors.push(`${id}: nome ausente`);if(!branches.has(u.branch))errors.push(`${id}: ramo inválido`);for(const k of ['power','defense','mobility','support'])if(!Number.isFinite(Number(u.game_stats?.[k])))errors.push(`${id}: game_stats.${k} inválido`)}
for(const [id,t] of Object.entries(territories)){if(!t.name)errors.push(`${id}: território sem nome`)}
if(errors.length){console.error(`❌ ${errors.length} problema(s):\n${errors.join('\n')}`);process.exit(1)}
console.log(`✅ Catálogo militar válido: ${Object.keys(catalog).length} modelos fictícios; ${Object.keys(territories).length} territórios disponíveis para baseamento.`);

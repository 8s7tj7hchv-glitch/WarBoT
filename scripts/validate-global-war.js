import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'data','global_war');
const errors=[];
const expected={
  'world_wars.json':'array',
  'world_events.json':'array',
  'world_snapshots.json':'array',
  'world_rankings.json':'array',
  'world_config.json':'object'
};
for(const [name,type] of Object.entries(expected)){
  const file=path.join(dir,name);
  if(!fs.existsSync(file)){errors.push(`${name} ausente`);continue;}
  try{const d=JSON.parse(fs.readFileSync(file,'utf8'));if(type==='array'&&!Array.isArray(d))errors.push(`${name} deve ser lista`);if(type==='object'&&(!d||Array.isArray(d)||typeof d!=='object'))errors.push(`${name} deve ser objeto`);}catch(e){errors.push(`${name}: ${e.message}`)}
}
if(errors.length){console.error('❌ '+errors.join('\n'));process.exit(1)}
console.log('✅ Dados da Fase 9 válidos: guerras mundiais, eventos, snapshots, ranking e configuração global.');

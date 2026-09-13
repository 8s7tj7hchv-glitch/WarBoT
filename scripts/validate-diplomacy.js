import fs from 'node:fs';import path from 'node:path';import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const dir=path.join(root,'data','diplomacy');const errors=[];
const expected={ 'alliances.json':'array','treaties.json':'array','relations.json':'object','restrictions.json':'array' };
for(const [name,type] of Object.entries(expected)){const f=path.join(dir,name);if(!fs.existsSync(f)){errors.push(`${name} ausente`);continue}try{const d=JSON.parse(fs.readFileSync(f,'utf8'));if(type==='array'&&!Array.isArray(d))errors.push(`${name} deve ser lista`);if(type==='object'&&(Array.isArray(d)||!d||typeof d!=='object'))errors.push(`${name} deve ser objeto`)}catch(e){errors.push(`${name}: ${e.message}`)}}
if(errors.length){console.error('❌ '+errors.join('\n'));process.exit(1)}console.log('✅ Dados da Fase 8 válidos: alianças, tratados, relações e restrições.');

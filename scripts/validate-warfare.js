import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'data','warfare');
const errors=[];
for(const name of ['conflicts.json','battles.json','economic_effects.json']){
 const f=path.join(dir,name); if(!fs.existsSync(f)){errors.push(`${name} ausente`);continue}
 try{const d=JSON.parse(fs.readFileSync(f,'utf8'));if(!Array.isArray(d))errors.push(`${name} deve ser uma lista`)}catch(e){errors.push(`${name}: ${e.message}`)}
}
if(errors.length){console.error('❌ '+errors.join('\n'));process.exit(1)}
console.log('✅ Dados da Fase 7 válidos: conflitos, batalhas e efeitos econômicos.');

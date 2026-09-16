import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
let systems=new Map();
export async function discoverSystems(){systems=new Map();const d=path.resolve('src/systems/manifests');fs.mkdirSync(d,{recursive:true});for(const f of fs.readdirSync(d).filter(x=>x.endsWith('.system.js'))){const m=(await import(pathToFileURL(path.join(d,f)).href)).default;if(m?.id&&m?.name){systems.set(m.id,{...m,emoji:m.emoji||'⚙️'});console.log(`🧩 Sistema detectado: ${m.emoji||'⚙️'} ${m.name}`);}}return getSystems();}
export const getSystems=()=>[...systems.values()]; export const getSystem=id=>systems.get(id)||null;

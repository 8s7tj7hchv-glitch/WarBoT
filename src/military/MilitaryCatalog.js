import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { MILITARY_DATA_DIR } from '../config/settings.js';
const FILE=path.join(MILITARY_DATA_DIR,'unit_catalog.json');
const clone=v=>structuredClone(v);
export class MilitaryCatalog{
 constructor(){JsonManager.ensureFile(FILE,{})}
 load(){const d=JsonManager.load(FILE,{});return d&&typeof d==='object'&&!Array.isArray(d)?d:{}}
 get(id){const x=this.load()[String(id)];return x?{id:String(id),...clone(x)}:null}
 list(){return Object.entries(this.load()).map(([id,x])=>({id,...clone(x)}))}
 byBranch(branch){return this.list().filter(x=>x.branch===String(branch))}
}

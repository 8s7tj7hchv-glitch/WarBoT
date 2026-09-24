import fs from 'node:fs';
import path from 'node:path';

const dataRoot = process.env.TNT_DATA_DIR || './data';
const file = path.join(dataRoot, 'military-factories', 'factories.json');
function ensureFile(){ fs.mkdirSync(path.dirname(file),{recursive:true}); if(!fs.existsSync(file)) fs.writeFileSync(file,'{}\n'); }
export function loadFactoryState(){ ensureFile(); try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return {}; } }
export function saveFactoryState(data){ ensureFile(); const tmp=`${file}.tmp`; fs.writeFileSync(tmp,JSON.stringify(data,null,2)); fs.renameSync(tmp,file); }

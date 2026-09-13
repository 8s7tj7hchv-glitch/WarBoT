import path from 'node:path';
import { JsonManager } from '../core/JsonManager.js';
import { DIPLOMACY_DATA_DIR } from '../config/settings.js';
const FILE = path.join(DIPLOMACY_DATA_DIR, 'relations.json');
const clamp=(n,min=-100,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
const pair=(a,b)=>[String(a),String(b)].sort().join('::');
export class RelationManager{
 constructor(){JsonManager.ensureFile(FILE,{})}
 load(){const d=JsonManager.load(FILE,{});return d&&typeof d==='object'&&!Array.isArray(d)?d:{}}
 save(d){JsonManager.save(FILE,d)}
 get(a,b){if(String(a)===String(b))return {score:100,status:'self'};const d=this.load()[pair(a,b)]??{score:0,updated_at:null};const score=clamp(d.score);return {...d,score,status:this.status(score)}}
 status(score){score=Number(score);if(score>=75)return 'allied';if(score>=30)return 'friendly';if(score>-30)return 'neutral';if(score>-75)return 'hostile';return 'rival'}
 set(a,b,score,reason='ajuste diplomático'){const d=this.load(),k=pair(a,b);d[k]={score:clamp(score),reason:String(reason).slice(0,120),updated_at:new Date().toISOString()};this.save(d);return this.get(a,b)}
 adjust(a,b,delta,reason='evento diplomático'){const cur=this.get(a,b);return this.set(a,b,cur.score+Number(delta||0),reason)}
 listFor(countryId){const cid=String(countryId);const d=this.load();return Object.entries(d).filter(([k])=>k.split('::').includes(cid)).map(([k,v])=>{const [a,b]=k.split('::');const other=a===cid?b:a;return {country_id:other,...this.get(cid,other),reason:v.reason}}).sort((x,y)=>y.score-x.score)}
}

import fs from 'node:fs';import path from 'node:path';const F=path.resolve('data/systems-state.json');
const read=()=>{try{return JSON.parse(fs.readFileSync(F,'utf8'));}catch{return {guilds:{}}}};const write=d=>{fs.mkdirSync(path.dirname(F),{recursive:true});fs.writeFileSync(F,JSON.stringify(d,null,2));};
export const isSystemEnabled=(g,k)=>read().guilds?.[g]?.[k]!==false;
export function setSystemEnabled(g,k,v){const d=read();d.guilds??={};d.guilds[g]??={};d.guilds[g][k]=!!v;write(d);}

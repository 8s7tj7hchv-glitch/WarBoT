import fs from 'node:fs';
import path from 'node:path';
const DATA_DIR=process.env.TNT_DATA_DIR||'./data';
const FILE=path.join(DATA_DIR,'military-factories','upgrades.json');
const TYPES=Object.freeze({
 automation:{id:'automation',name:'Automação Industrial',emoji:'🤖',maxLevel:10,description:'Aumenta a eficiência abstrata da linha.'},
 storage:{id:'storage',name:'Expansão de Armazenamento',emoji:'📦',maxLevel:10,description:'Amplia a capacidade industrial do jogo.'},
 energy:{id:'energy',name:'Eficiência Energética',emoji:'⚡',maxLevel:10,description:'Reduz o consumo abstrato de energia.'},
 quality:{id:'quality',name:'Controle de Qualidade',emoji:'⭐',maxLevel:10,description:'Melhora o bônus abstrato de qualidade.'},
 logistics:{id:'logistics',name:'Integração Logística',emoji:'🚚',maxLevel:10,description:'Melhora a eficiência das entregas do jogo.'}
});
function read(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {players:{}};}}
function write(v){fs.mkdirSync(path.dirname(FILE),{recursive:true});fs.writeFileSync(FILE,JSON.stringify(v,null,2));}
function ensureFactory(db,userId,factoryId){const u=String(userId);db.players[u]??={};db.players[u][factoryId]??={};for(const k of Object.keys(TYPES))db.players[u][factoryId][k]??=0;return db.players[u][factoryId];}
export class FactoryUpgradeManager{
 catalog(){return Object.values(TYPES);}
 get(userId,factoryId){const db=read();const state=ensureFactory(db,userId,factoryId);write(db);return {...state};}
 upgrade(userId,factoryId,type){const meta=TYPES[type];if(!meta)throw new Error('Melhoria inválida.');const db=read();const state=ensureFactory(db,userId,factoryId);if(state[type]>=meta.maxLevel)throw new Error('Melhoria já está no nível máximo.');state[type]+=1;write(db);return {type,level:state[type],maxLevel:meta.maxLevel};}
 bonuses(userId,factoryId){const s=this.get(userId,factoryId);return {efficiencyBonus:s.automation*2,storageBonus:s.storage*5,energyReduction:s.energy*2,qualityBonus:s.quality,logisticsBonus:s.logistics*2};}
}
export const factoryUpgradeManager=new FactoryUpgradeManager();

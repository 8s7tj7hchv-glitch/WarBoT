import fs from 'node:fs';
import path from 'node:path';

const file=path.resolve(process.env.TNT_DATA_DIR||'data','military-factories','achievements.json');
function load(){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return {};}}
function save(v){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(v,null,2));}

export const ACHIEVEMENTS=Object.freeze([
 {id:'first_factory',emoji:'🏭',name:'Primeira Fábrica',description:'Inicialize sua primeira área industrial.',metric:'factories',goal:1,reward:{xp:100,credits:500,title:'Operador Industrial'}},
 {id:'all_factories',emoji:'🏗️',name:'Complexo Completo',description:'Inicialize as 12 áreas industriais.',metric:'factories',goal:12,reward:{xp:1000,credits:7500,title:'Diretor Industrial'}},
 {id:'production_100',emoji:'⚙️',name:'Produção em Escala',description:'Conclua 100 unidades/lotes de produção.',metric:'completed',goal:100,reward:{xp:1200,credits:10000,title:'Mestre da Produção'}},
 {id:'quality_90',emoji:'⭐',name:'Excelência Industrial',description:'Alcance qualidade média 90 ou superior.',metric:'quality',goal:90,reward:{xp:900,credits:6000,title:'Especialista em Qualidade'}},
 {id:'research_10',emoji:'🔬',name:'Centro Avançado',description:'Alcance nível 10 em uma linha de pesquisa.',metric:'research',goal:10,reward:{xp:1200,credits:8000,title:'Pesquisador Industrial'}},
 {id:'deliveries_25',emoji:'🚚',name:'Ponte Industrial',description:'Conclua 25 entregas integradas.',metric:'deliveries',goal:25,reward:{xp:800,credits:5000,title:'Mestre da Logística'}},
 {id:'contracts_25',emoji:'📑',name:'Fornecedor Nacional',description:'Conclua 25 pedidos militares do jogo.',metric:'contracts',goal:25,reward:{xp:1000,credits:7000,title:'Fornecedor Nacional'}},
 {id:'cert_master',emoji:'🏆',name:'Mestre Industrial',description:'Alcance a certificação máxima em uma fábrica.',metric:'masterCertifications',goal:1,reward:{xp:2000,credits:15000,title:'Mestre Industrial'}}
]);

export class IndustrialAchievementManager{
 profile(userId){const db=load();return db[userId]??{xp:0,credits:0,unlocked:[],titles:[]};}
 evaluate(userId,stats={}){
  const db=load(); const p=db[userId]??{xp:0,credits:0,unlocked:[],titles:[]}; const newly=[];
  for(const a of ACHIEVEMENTS){
   if(p.unlocked.includes(a.id)) continue;
   if(Number(stats[a.metric]||0)<a.goal) continue;
   p.unlocked.push(a.id); p.xp+=a.reward.xp; p.credits+=a.reward.credits;
   if(a.reward.title&&!p.titles.includes(a.reward.title)) p.titles.push(a.reward.title);
   newly.push(a);
  }
  db[userId]=p; save(db); return {profile:p,newly};
 }
 list(userId,stats={}){const p=this.evaluate(userId,stats).profile;return ACHIEVEMENTS.map(a=>({...a,value:Math.min(a.goal,Number(stats[a.metric]||0)),unlocked:p.unlocked.includes(a.id)}));}
}
export const industrialAchievementManager=new IndustrialAchievementManager();

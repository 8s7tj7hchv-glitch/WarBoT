import fs from 'node:fs/promises';
import path from 'node:path';
const FILE=path.resolve('src/data/giveaway-audit.json');
class Logger{
 async read(){try{return JSON.parse(await fs.readFile(FILE,'utf8'))}catch{return []}}
 async log(event){
  const data=await this.read();
  data.push({id:`audit_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,at:Date.now(),...event});
  const trimmed=data.slice(-5000);
  await fs.mkdir(path.dirname(FILE),{recursive:true});
  await fs.writeFile(FILE,JSON.stringify(trimmed,null,2),'utf8');
 }
 async guild(guildId,limit=25){return (await this.read()).filter(x=>x.guildId===guildId).slice(-limit).reverse()}
}
export const giveawayAuditLogger=new Logger();

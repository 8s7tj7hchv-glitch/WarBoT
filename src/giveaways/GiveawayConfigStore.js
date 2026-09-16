import fs from 'node:fs/promises';
import path from 'node:path';
const FILE=path.resolve('src/data/giveaway-config.json');
const defaults={defaultChannelId:null,adminRoleId:null,pingRoleId:null,defaultMessage:'🎉 Novo sorteio!',templates:{}};
class Store{
 async read(){try{return JSON.parse(await fs.readFile(FILE,'utf8'))}catch{return {}}}
 async write(d){await fs.mkdir(path.dirname(FILE),{recursive:true});await fs.writeFile(FILE,JSON.stringify(d,null,2),'utf8')}
 async get(guildId){const d=await this.read();return {...defaults,...(d[guildId]||{}),templates:{...(d[guildId]?.templates||{})}}}
 async set(guildId,patch){const d=await this.read(),old=await this.get(guildId);d[guildId]={...old,...patch};await this.write(d);return d[guildId]}
}
export const giveawayConfigStore=new Store();

import fs from 'node:fs/promises';
import path from 'node:path';
const DATA_FILE=path.resolve('src/data/giveaways.json');
class GiveawayStore{
 async ensure(){await fs.mkdir(path.dirname(DATA_FILE),{recursive:true});try{await fs.access(DATA_FILE)}catch{await fs.writeFile(DATA_FILE,'{}','utf8')}}
 async read(){await this.ensure();try{return JSON.parse(await fs.readFile(DATA_FILE,'utf8'))}catch{return {}}}
 async write(d){await this.ensure();await fs.writeFile(DATA_FILE,JSON.stringify(d,null,2),'utf8')}
 async set(g){const d=await this.read();d[g.id]=g;await this.write(d);return g}
 async get(id){return (await this.read())[id]??null}
 async list(){return Object.values(await this.read())}
 async remove(id){const d=await this.read();if(!d[id])return false;delete d[id];await this.write(d);return true}
}
export const giveawayStore=new GiveawayStore();

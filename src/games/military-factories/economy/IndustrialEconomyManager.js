import fs from 'node:fs';
import path from 'node:path';
const root=process.env.TNT_DATA_DIR||'./data';
const file=path.join(root,'military-factories','economy.json');
function ensure(){fs.mkdirSync(path.dirname(file),{recursive:true});if(!fs.existsSync(file))fs.writeFileSync(file,'{}\n');}
function load(){ensure();try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return {};}}
function save(v){ensure();const t=`${file}.tmp`;fs.writeFileSync(t,JSON.stringify(v,null,2));fs.renameSync(t,file);}
function now(){return new Date().toISOString();}
export class IndustrialEconomyManager{
 #data=load();
 ensure(ownerId){if(!this.#data[ownerId])this.#data[ownerId]={balance:25000,totalEarned:0,totalSpent:0,transactions:[]};return this.#data[ownerId];}
 balance(ownerId){return this.ensure(ownerId).balance;}
 credit(ownerId,amount,{type='credit',description='Crédito industrial',reference=null}={}){amount=Math.max(0,Math.floor(Number(amount)||0));const s=this.ensure(ownerId);s.balance+=amount;s.totalEarned+=amount;s.transactions.unshift({id:`TX-${Date.now().toString(36).toUpperCase()}`,type,amount,description,reference,createdAt:now()});s.transactions=s.transactions.slice(0,100);save(this.#data);return s.balance;}
 debit(ownerId,amount,{type='debit',description='Débito industrial',reference=null}={}){amount=Math.max(0,Math.floor(Number(amount)||0));const s=this.ensure(ownerId);if(s.balance<amount)throw new Error('Créditos industriais insuficientes.');s.balance-=amount;s.totalSpent+=amount;s.transactions.unshift({id:`TX-${Date.now().toString(36).toUpperCase()}`,type,amount:-amount,description,reference,createdAt:now()});s.transactions=s.transactions.slice(0,100);save(this.#data);return s.balance;}
 contractReward(ownerId,contract){if(!contract)throw new Error('Contrato inválido.');if(contract.rewardPaid)return 0;const amount=Math.max(0,Math.floor(Number(contract.reward)||0));if(amount>0)this.credit(ownerId,amount,{type:'contract_reward',description:`Pagamento do contrato ${contract.id}`,reference:contract.id});contract.rewardPaid=true;contract.rewardPaidAt=now();return amount;}
 snapshot(ownerId){const s=this.ensure(ownerId);return structuredClone({...s,transactions:s.transactions.slice(0,10)});}
}
export const industrialEconomyManager=new IndustrialEconomyManager();

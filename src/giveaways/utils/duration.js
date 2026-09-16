export function parseDuration(input){
 const m=String(input).trim().toLowerCase().match(/^(\d+)\s*([smhdw])$/);
 if(!m)return null;
 const units={s:1000,m:60000,h:3600000,d:86400000,w:604800000};
 const ms=Number(m[1])*units[m[2]];
 return Number.isSafeInteger(ms)&&ms>=10000?ms:null;
}

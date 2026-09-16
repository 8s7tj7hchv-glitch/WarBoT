import crypto from 'node:crypto';

export function pickWeightedUnique(entries, count) {
  const pool = entries.filter(e => e && e.userId && e.weight > 0).map(e => ({...e}));
  const winners = [];
  while (pool.length && winners.length < count) {
    const total = pool.reduce((sum,e)=>sum+e.weight,0);
    let roll = crypto.randomInt(0,total);
    let chosen = 0;
    for (let i=0;i<pool.length;i++) {
      roll -= pool[i].weight;
      if (roll < 0) { chosen=i; break; }
    }
    winners.push(pool.splice(chosen,1)[0].userId);
  }
  return winners;
}

export function pickRandomUnique(items,count) {
  return pickWeightedUnique([...new Set(items)].map(userId=>({userId,weight:1})),count);
}

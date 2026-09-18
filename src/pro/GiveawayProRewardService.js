import { ProPlayerManager } from './ProPlayerManager.js';
const patterns=[/\bPRO\s*[:\-]\s*(\d{1,4})\s*(?:D|DIAS?)\b/i,/PRO\s*PLAYER[^\d]{0,20}(\d{1,4})\s*DIAS?/i];
export function parseProPrize(text){const s=String(text||'');for(const p of patterns){const m=s.match(p);if(m)return Math.min(3650,Math.max(1,Number(m[1])));}return null;}
export async function awardProFromGiveaway(g){const days=parseProPrize(g?.prize);if(!days||!Array.isArray(g?.winners)||!g.winners.length)return[];const pro=new ProPlayerManager();return g.winners.map(userId=>pro.grantEarned({userId,days,source:'giveaway',sourceId:g.id,details:{guild_id:g.guildId,prize:g.prize}}));}

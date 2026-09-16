import { EmbedBuilder } from 'discord.js';
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export async function sendMaintenanceNotice(g,s,on){const c=g.channels.cache.find(x=>x?.isTextBased?.()&&norm(x.name)==='manutencao');if(!c)return false;await c.send({embeds:[new EmbedBuilder().setTitle(on?'✅ SISTEMA RESTABELECIDO':'🔧 MANUTENÇÃO').setDescription(`${s.emoji} **${s.name}** — ${on?'🟢 Ativado novamente':'🔴 Temporariamente indisponível'}`).setTimestamp()]});return true;}

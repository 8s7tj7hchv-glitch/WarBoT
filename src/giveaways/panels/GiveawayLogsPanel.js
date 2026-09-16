const names={
 create:'➕ Criado',join:'🎉 Participação',leave:'↩️ Saída',edit:'✏️ Editado',
 cancel:'🚫 Cancelado',end:'🏁 Encerrado',delete:'🗑️ Excluído',
 reroll_one:'🎲 Reroll individual',reroll_all:'🔄 Reroll completo',
 schedule:'⏰ Agendado',template:'📋 Template',config:'⚙️ Configuração'
};
export function buildLogsText(logs){
 if(!logs.length)return '📭 Nenhum evento de auditoria registrado.';
 return '📊 **Auditoria de Sorteios**\n\n'+logs.map(x=>
  `${names[x.action]||x.action} • <t:${Math.floor(x.at/1000)}:R>\n`+
  `Usuário: ${x.userId?`<@${x.userId}>`:'Sistema'}${x.giveawayId?` • ID: \`${x.giveawayId}\``:''}`
 ).join('\n\n');
}

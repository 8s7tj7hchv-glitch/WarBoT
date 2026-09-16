export function validateGiveawayRequirements(giveaway, member) {
  const r = giveaway.requirements || {};
  const reasons = [];

  if (r.requiredRoleIds?.length) {
    const missing = r.requiredRoleIds.filter(id => !member.roles.cache.has(id));
    if (missing.length) reasons.push(`Cargo(s) obrigatório(s): ${missing.map(id => `<@&${id}>`).join(', ')}`);
  }

  if (r.blockedRoleIds?.some(id => member.roles.cache.has(id))) {
    reasons.push('Você possui um cargo que não pode participar deste sorteio.');
  }

  if (r.minAccountAgeDays > 0) {
    const age = Date.now() - member.user.createdTimestamp;
    if (age < r.minAccountAgeDays * 86400000)
      reasons.push(`Sua conta precisa ter pelo menos ${r.minAccountAgeDays} dia(s).`);
  }

  if (r.minServerAgeDays > 0) {
    const joined = member.joinedTimestamp || Date.now();
    if (Date.now() - joined < r.minServerAgeDays * 86400000)
      reasons.push(`Você precisa estar no servidor há pelo menos ${r.minServerAgeDays} dia(s).`);
  }

  return { allowed: reasons.length === 0, reasons };
}

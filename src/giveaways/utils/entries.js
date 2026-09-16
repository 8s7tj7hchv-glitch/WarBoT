export function calculateEntries(giveaway, member) {
  const bonus = giveaway.entryConfig?.roleBonuses || {};
  let entries = 1;
  for (const [roleId, extra] of Object.entries(bonus)) {
    if (member.roles.cache.has(roleId)) entries += Number(extra) || 0;
  }
  return Math.max(1, Math.min(entries, 100));
}

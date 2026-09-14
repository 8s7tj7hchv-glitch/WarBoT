export function getConfiguredOwnerId() {
  return String(process.env.BOT_OWNER_ID ?? '').trim();
}

export function isBotOwner(userId) {
  const ownerId = getConfiguredOwnerId();
  return Boolean(ownerId) && String(userId) === ownerId;
}

export function assertBotOwner(userId) {
  if (!getConfiguredOwnerId()) {
    throw new Error('BOT_OWNER_ID não configurado no arquivo .env.');
  }
  if (!isBotOwner(userId)) {
    throw new Error('Este painel é exclusivo do dono do bot.');
  }
}

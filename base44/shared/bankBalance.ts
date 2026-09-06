export async function getOwnedBankAccount(base44, userId, accountId) {
  const account = await base44.asServiceRole.entities.BankAccount.get(accountId);
  if (!account || account.created_by_id !== userId) {
    const error = new Error('Forbidden bank account access');
    error.status = 403;
    throw error;
  }
  return account;
}

export async function adjustOwnedBankBalance(base44, userId, accountId, delta, lastUpdated) {
  if (!accountId || !delta) return null;
  const account = await getOwnedBankAccount(base44, userId, accountId);
  await base44.asServiceRole.entities.BankAccount.updateMany(
    { id: accountId, created_by_id: userId },
    {
      $inc: { balance: delta },
      $set: { last_updated: lastUpdated || new Date().toISOString().slice(0, 10) },
    }
  );
  return { accountId, delta, previousLastUpdated: account.last_updated || null };
}

export async function rollbackBankAdjustment(base44, userId, change) {
  if (!change) return;
  const update = change.previousLastUpdated
    ? { $inc: { balance: -change.delta }, $set: { last_updated: change.previousLastUpdated } }
    : { $inc: { balance: -change.delta }, $unset: { last_updated: '' } };
  await base44.asServiceRole.entities.BankAccount.updateMany(
    { id: change.accountId, created_by_id: userId },
    update
  );
}
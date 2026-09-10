export async function getOwnedBankAccount(base44, userId, accountId) {
  const account = await base44.asServiceRole.entities.BankAccount.get(accountId);
  if (!account || account.created_by_id !== userId) {
    const error = new Error('Forbidden bank account access');
    error.status = 403;
    throw error;
  }
  return account;
}

export async function resolveOwnedBankAccount(base44, userId, accountId, accountName) {
  if (accountId) {
    try {
      return await getOwnedBankAccount(base44, userId, accountId);
    } catch (error) {
      if ((error.status || error.response?.status) !== 404 || !accountName) throw error;
    }
  }
  if (!accountName) return null;
  const matches = await base44.asServiceRole.entities.BankAccount.filter(
    { created_by_id: userId, name: accountName },
    '-updated_date',
    1,
  );
  if (matches.length) return matches[0];
  const error = new Error(`Bank account not found: ${accountName}`);
  error.status = 404;
  throw error;
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
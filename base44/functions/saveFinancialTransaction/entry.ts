import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { adjustOwnedBankBalance, getOwnedBankAccount, rollbackBankAdjustment } from '../../shared/bankBalance.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { kind, action, id, data } = await req.json();
    if (!['expense', 'income'].includes(kind) || !['create', 'update', 'delete'].includes(action)) {
      return Response.json({ error: 'Invalid transaction request' }, { status: 400 });
    }

    const entity = kind === 'expense' ? base44.entities.Expense : base44.entities.Income;
    const balanceSign = kind === 'income' ? 1 : -1;
    const appliedChanges = [];
    const balanceEffect = (item) => kind === 'expense' && item?.category === 'transfer'
      ? 0
      : balanceSign * Number(item?.amount || 0);

    const adjustBalance = async (accountId, delta, date) => {
      if (!accountId || !delta) return;
      const change = await adjustOwnedBankBalance(base44, user.id, accountId, delta, date);
      if (change) appliedChanges.push(change);
    };

    const rollbackBalances = async () => {
      for (const change of [...appliedChanges].reverse()) {
        await rollbackBankAdjustment(base44, user.id, change);
      }
    };

    if (action === 'create') {
      if (!data || !Number.isFinite(Number(data.amount))) {
        return Response.json({ error: 'A valid amount is required' }, { status: 400 });
      }
      if (data.bank_account_id) await getOwnedBankAccount(base44, user.id, data.bank_account_id);
      const normalizedData = { ...data, amount: Number(data.amount) };
      const created = await entity.create(normalizedData);
      try {
        await adjustBalance(data.bank_account_id, balanceEffect(normalizedData), data.date);
        return Response.json({ item: created });
      } catch (error) {
        await entity.delete(created.id);
        await rollbackBalances();
        throw error;
      }
    }

    if (!id) return Response.json({ error: 'Transaction ID is required' }, { status: 400 });
    const existing = await entity.get(id);

    if (action === 'delete') {
      try {
        await adjustBalance(existing.bank_account_id, -balanceEffect(existing), existing.date);
        await entity.delete(id);
        return Response.json({ id });
      } catch (error) {
        await rollbackBalances();
        throw error;
      }
    }

    if (!data || !Number.isFinite(Number(data.amount))) {
      return Response.json({ error: 'A valid amount is required' }, { status: 400 });
    }

    const normalizedData = { ...data, amount: Number(data.amount) };
    const oldAccountId = existing.bank_account_id || '';
    const newAccountId = data.bank_account_id || '';
    const oldEffect = balanceEffect(existing);
    const newEffect = balanceEffect(normalizedData);

    if (oldAccountId) await getOwnedBankAccount(base44, user.id, oldAccountId);
    if (newAccountId && newAccountId !== oldAccountId) await getOwnedBankAccount(base44, user.id, newAccountId);

    const updated = await entity.update(id, normalizedData);
    try {
      if (oldAccountId === newAccountId) {
        await adjustBalance(oldAccountId, newEffect - oldEffect, data.date || existing.date);
      } else {
        await adjustBalance(oldAccountId, -oldEffect, data.date || existing.date);
        await adjustBalance(newAccountId, newEffect, data.date || existing.date);
      }
      return Response.json({ item: updated });
    } catch (error) {
      await rollbackBalances();
      const rollbackData = { ...existing };
      delete rollbackData.id;
      delete rollbackData.created_date;
      delete rollbackData.updated_date;
      delete rollbackData.created_by_id;
      await entity.update(id, rollbackData);
      throw error;
    }
  } catch (error) {
    return Response.json(
      { error: error.message || 'Unable to save transaction' },
      { status: error.status || 500 }
    );
  }
}
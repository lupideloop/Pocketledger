import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
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
    const appliedDeltas = [];

    const adjustBalance = async (accountId, delta) => {
      if (!accountId || !delta) return;
      await base44.entities.BankAccount.get(accountId);
      await base44.entities.BankAccount.updateMany(
        { id: accountId },
        { $inc: { balance: delta } }
      );
      appliedDeltas.push({ accountId, delta });
    };

    const rollbackBalances = async () => {
      for (const change of [...appliedDeltas].reverse()) {
        await base44.entities.BankAccount.updateMany(
          { id: change.accountId },
          { $inc: { balance: -change.delta } }
        );
      }
    };

    if (action === 'create') {
      if (!data || !Number.isFinite(Number(data.amount))) {
        return Response.json({ error: 'A valid amount is required' }, { status: 400 });
      }
      const created = await entity.create({ ...data, amount: Number(data.amount) });
      try {
        await adjustBalance(data.bank_account_id, balanceSign * Number(data.amount));
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
        await adjustBalance(existing.bank_account_id, -balanceSign * Number(existing.amount || 0));
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

    const newAmount = Number(data.amount);
    const oldAmount = Number(existing.amount || 0);
    const oldAccountId = existing.bank_account_id || '';
    const newAccountId = data.bank_account_id || '';

    if (oldAccountId) await base44.entities.BankAccount.get(oldAccountId);
    if (newAccountId && newAccountId !== oldAccountId) await base44.entities.BankAccount.get(newAccountId);

    const updated = await entity.update(id, { ...data, amount: newAmount });
    try {
      if (oldAccountId === newAccountId) {
        await adjustBalance(oldAccountId, balanceSign * (newAmount - oldAmount));
      } else {
        await adjustBalance(oldAccountId, -balanceSign * oldAmount);
        await adjustBalance(newAccountId, balanceSign * newAmount);
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
    return Response.json({ error: error.message || 'Unable to save transaction' }, { status: 500 });
  }
});
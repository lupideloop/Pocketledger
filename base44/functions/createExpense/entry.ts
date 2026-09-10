import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { adjustOwnedBankBalance, resolveOwnedBankAccount } from '../../shared/bankBalance.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json();
    if (typeof payload.title !== 'string' || !payload.title.trim()) {
      return Response.json({ error: 'Title is required.' }, { status: 400 });
    }
    if (typeof payload.amount !== 'number' || !Number.isFinite(payload.amount) || payload.amount <= 0) {
      return Response.json({ error: 'Amount is required and must be a positive number.' }, { status: 400 });
    }

    const date = payload.date || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json({ error: 'Date must use YYYY-MM-DD format.' }, { status: 400 });
    }

    const requestedAccountId = typeof payload.bank_account_id === 'string' ? payload.bank_account_id.trim() : '';
    const accountName = typeof payload.bank_account_name === 'string' ? payload.bank_account_name.trim() : '';
    const account = await resolveOwnedBankAccount(base44, user.id, requestedAccountId, accountName);
    const accountId = account?.id || '';
    const category = payload.category || 'other';
    const expense = {
      title: payload.title.trim(),
      amount: payload.amount,
      category,
      date,
      recurring: payload.recurring ?? false,
      recurrence: payload.recurrence || 'one-time',
      ...(typeof payload.notes === 'string' && payload.notes.trim() ? { notes: payload.notes.trim() } : {}),
      ...(accountId ? { bank_account_id: accountId } : {}),
      ...(account ? { bank_account_name: account.name } : {}),
    };
    const created = await base44.entities.Expense.create(expense);
    try {
      if (category !== 'transfer') {
        await adjustOwnedBankBalance(base44, user.id, accountId, -payload.amount, date);
      }
      return Response.json(created, { status: 201 });
    } catch (error) {
      await base44.entities.Expense.delete(created.id);
      throw error;
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.status || 500 });
  }
}
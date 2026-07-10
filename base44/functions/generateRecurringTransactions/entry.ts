import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function occurrenceDate(startDate, recurrence, index) {
  const [year, month, day] = startDate.split('-').map(Number);
  if (recurrence === 'weekly' || recurrence === 'bi-weekly') {
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + index * (recurrence === 'weekly' ? 7 : 14));
    return date.toISOString().slice(0, 10);
  }
  if (recurrence === 'monthly') {
    const targetMonth = month - 1 + index;
    const targetYear = year + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;
    const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
    return new Date(Date.UTC(targetYear, normalizedMonth, Math.min(day, lastDay))).toISOString().slice(0, 10);
  }
  const lastDay = new Date(Date.UTC(year + index, month, 0)).getUTCDate();
  return new Date(Date.UTC(year + index, month - 1, Math.min(day, lastDay))).toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { dry_run: dryRun = false } = await req.json().catch(() => ({}));
    const today = new Date().toISOString().slice(0, 10);
    const [expenses, incomes] = await Promise.all([
      base44.asServiceRole.entities.Expense.list('-date', 5000),
      base44.asServiceRole.entities.Income.list('-date', 5000),
    ]);

    const pending = [];
    const collect = (items, kind) => {
      const keys = new Set(items.map(item => item.recurrence_key).filter(Boolean));
      const templates = items.filter(item => item.recurring && item.recurrence !== 'one-time' && !item.generated_by_recurrence && item.date);
      for (const template of templates) {
        for (let index = 1; index <= 500 && pending.length < 500; index += 1) {
          const date = occurrenceDate(template.date, template.recurrence, index);
          if (date > today) break;
          const recurrenceKey = `${template.id}:${date}`;
          if (keys.has(recurrenceKey)) continue;
          const common = {
            amount: Number(template.amount || 0), category: template.category, date,
            bank_account_id: template.bank_account_id || '', bank_account_name: template.bank_account_name || '',
            notes: template.notes || '', recurring: false, recurrence: 'one-time',
            recurring_parent_id: template.id, recurrence_key: recurrenceKey,
            generated_by_recurrence: true, created_by_id: template.created_by_id,
          };
          pending.push({
            kind,
            data: kind === 'expense' ? { ...common, title: template.title } : { ...common, source: template.source },
          });
          keys.add(recurrenceKey);
        }
      }
    };

    collect(expenses, 'expense');
    collect(incomes, 'income');
    if (dryRun) return Response.json({ due: pending.length });
    if (!pending.length) return Response.json({ generated: 0 });

    const expenseRows = pending.filter(item => item.kind === 'expense').map(item => item.data);
    const incomeRows = pending.filter(item => item.kind === 'income').map(item => item.data);
    const createdExpenses = expenseRows.length ? await base44.asServiceRole.entities.Expense.bulkCreate(expenseRows) : [];
    const createdIncomes = incomeRows.length ? await base44.asServiceRole.entities.Income.bulkCreate(incomeRows) : [];
    const created = [...createdExpenses.map(item => ({ kind: 'expense', id: item.id })), ...createdIncomes.map(item => ({ kind: 'income', id: item.id }))];

    const deltas = new Map();
    for (const item of pending) {
      const accountId = item.data.bank_account_id;
      if (!accountId) continue;
      const delta = item.kind === 'income' ? item.data.amount : -item.data.amount;
      deltas.set(accountId, (deltas.get(accountId) || 0) + delta);
    }

    const applied = [];
    try {
      for (const [accountId, delta] of deltas) {
        await base44.asServiceRole.entities.BankAccount.updateMany({ id: accountId }, { $inc: { balance: delta } });
        applied.push([accountId, delta]);
      }
    } catch (error) {
      for (const [accountId, delta] of applied.reverse()) {
        await base44.asServiceRole.entities.BankAccount.updateMany({ id: accountId }, { $inc: { balance: -delta } });
      }
      await Promise.all(created.map(item => item.kind === 'expense'
        ? base44.asServiceRole.entities.Expense.delete(item.id)
        : base44.asServiceRole.entities.Income.delete(item.id)));
      throw error;
    }

    return Response.json({ generated: pending.length });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to generate recurring transactions' }, { status: 500 });
  }
});
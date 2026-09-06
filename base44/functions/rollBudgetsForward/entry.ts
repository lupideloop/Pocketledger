import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const budgets = await base44.entities.Budget.list('-month', 5000);
    if (budgets.length === 0) {
      return Response.json({ summary: 'No budgets found to roll forward.', created_count: 0 });
    }

    const sourceMonth = budgets.reduce(
      (latest, budget) => budget.month > latest ? budget.month : latest,
      budgets[0].month
    );
    const [year, month] = sourceMonth.split('-').map(Number);
    const nextMonth = month === 12
      ? `${year + 1}-01`
      : `${year}-${String(month + 1).padStart(2, '0')}`;

    if (budgets.some(budget => budget.month === nextMonth)) {
      return Response.json({
        summary: `${nextMonth} already has budgets; nothing was created.`,
        created_count: 0,
        source_month: sourceMonth,
        month: nextMonth,
      });
    }

    const sourceBudgets = budgets.filter(budget => budget.month === sourceMonth);
    const created = await base44.entities.Budget.bulkCreate(sourceBudgets.map(budget => ({
      category: budget.category,
      monthly_limit: budget.monthly_limit,
      month: nextMonth,
      notes: budget.notes || '',
    })));

    return Response.json({
      summary: `Created ${created.length} budgets for ${nextMonth} from ${sourceMonth}.`,
      created_count: created.length,
      source_month: sourceMonth,
      month: nextMonth,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { adjustOwnedBankBalance, getOwnedBankAccount, rollbackBankAdjustment } from '../../shared/bankBalance.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json();
    const action = payload.action;
    if (!['create', 'delete'].includes(action)) return Response.json({ error: 'Invalid transfer action' }, { status: 400 });
    const appliedChanges = [];
    const adjust = async (accountId, delta, date) => {
      const change = await adjustOwnedBankBalance(base44, user.id, accountId, delta, date);
      if (change) appliedChanges.push(change);
    };
    const rollback = async () => {
      for (const change of [...appliedChanges].reverse()) await rollbackBankAdjustment(base44, user.id, change);
    };

    if (action === 'create') {
      const sourceId = typeof payload.source_account_id === 'string' ? payload.source_account_id : '';
      const destinationId = typeof payload.destination_account_id === 'string' ? payload.destination_account_id : '';
      const amount = Number(payload.amount);
      const date = payload.date;
      if (!sourceId || !destinationId) return Response.json({ error: 'Choose both accounts.' }, { status: 400 });
      if (sourceId === destinationId) return Response.json({ error: 'Source and destination accounts must be different.' }, { status: 400 });
      if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: 'Enter a positive transfer amount.' }, { status: 400 });
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: 'Choose a valid transfer date.' }, { status: 400 });

      const source = await getOwnedBankAccount(base44, user.id, sourceId);
      const destination = await getOwnedBankAccount(base44, user.id, destinationId);
      const transfer = await base44.entities.Transfer.create({
        source_account_id: sourceId,
        source_account_name: source.name,
        destination_account_id: destinationId,
        destination_account_name: destination.name,
        amount,
        date,
        ...(typeof payload.notes === 'string' && payload.notes.trim() ? { notes: payload.notes.trim() } : {}),
      });
      try {
        await adjust(sourceId, -amount, date);
        await adjust(destinationId, amount, date);
        return Response.json({ item: transfer }, { status: 201 });
      } catch (error) {
        await rollback();
        await base44.entities.Transfer.delete(transfer.id);
        throw error;
      }
    }

    if (typeof payload.id !== 'string' || !payload.id) return Response.json({ error: 'Transfer ID is required.' }, { status: 400 });
    const transfer = await base44.entities.Transfer.get(payload.id);
    await getOwnedBankAccount(base44, user.id, transfer.source_account_id);
    await getOwnedBankAccount(base44, user.id, transfer.destination_account_id);
    try {
      await adjust(transfer.source_account_id, Number(transfer.amount), transfer.date);
      await adjust(transfer.destination_account_id, -Number(transfer.amount), transfer.date);
      await base44.entities.Transfer.delete(transfer.id);
      return Response.json({ id: transfer.id });
    } catch (error) {
      await rollback();
      throw error;
    }
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to save transfer' }, { status: error.status || 500 });
  }
}
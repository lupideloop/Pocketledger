import { Field, Input, Select, Textarea } from "@/components/finance/FieldGroup";
import FormError from "@/components/finance/FormError";

export default function TransferFormFields({ form, setForm, accounts, error }) {
  return (
    <>
      <Field label="From Account"><Select value={form.source_account_id} onChange={e => setForm(current => ({ ...current, source_account_id: e.target.value }))} required><option value="">Choose source account</option>{accounts.filter(item => item.id !== form.destination_account_id).map(item => <option key={item.id} value={item.id}>{item.name} ({item.institution})</option>)}</Select></Field>
      <Field label="To Account"><Select value={form.destination_account_id} onChange={e => setForm(current => ({ ...current, destination_account_id: e.target.value }))} required><option value="">Choose destination account</option>{accounts.filter(item => item.id !== form.source_account_id).map(item => <option key={item.id} value={item.id}>{item.name} ({item.institution})</option>)}</Select></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount"><Input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm(current => ({ ...current, amount: e.target.value }))} placeholder="0.00" required /></Field>
        <Field label="Date"><Input type="date" value={form.date} onChange={e => setForm(current => ({ ...current, date: e.target.value }))} required /></Field>
      </div>
      <Field label="Notes (optional)"><Textarea value={form.notes} onChange={e => setForm(current => ({ ...current, notes: e.target.value }))} placeholder="What is this transfer for?" /></Field>
      <FormError message={error} />
    </>
  );
}
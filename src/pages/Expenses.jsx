import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Pencil, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/finance/FormModal";
import { Field, Input, Select, Textarea } from "@/components/finance/FieldGroup";
import { useTheme } from "@/components/finance/ThemeContext";

const CATEGORIES = ["housing","food","transport","utilities","healthcare","entertainment","shopping","education","insurance","savings","debt","other"];
const CAT_LABELS = { housing:"Housing", food:"Food", transport:"Transport", utilities:"Utilities", healthcare:"Healthcare", entertainment:"Entertainment", shopping:"Shopping", education:"Education", insurance:"Insurance", savings:"Savings", debt:"Debt", other:"Other" };
const RECURRENCES = ["one-time","monthly","weekly","yearly"];
const empty = { title:"", amount:"", category:"food", date: new Date().toISOString().split("T")[0], notes:"", recurring: false, recurrence:"one-time", bank_account_id:"", bank_account_name:"" };

export default function Expenses() {
  const { dark, fmt } = useTheme();
  const [items, setItems] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const load = () => base44.entities.Expense.list("-date", 100).then(d => { setItems(d); setLoading(false); });
  useEffect(() => {
    load();
    base44.entities.BankAccount.list().then(setBankAccounts);
  }, []);

  const openAdd = () => { setForm(empty); setEditingId(null); setShowModal(true); };
  const openEdit = (item) => { setForm({ ...item, amount: item.amount ?? "" }); setEditingId(item.id); setShowModal(true); };

  const handleBankChange = (id) => {
    const acct = bankAccounts.find(b => b.id === id);
    setForm(f => ({ ...f, bank_account_id: id, bank_account_name: acct ? acct.name : "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = { ...form, amount: parseFloat(form.amount) };
    if (editingId) await base44.entities.Expense.update(editingId, data);
    else await base44.entities.Expense.create(data);
    await load();
    setShowModal(false);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Expense.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const total = items.reduce((s, i) => s + (i.amount || 0), 0);
  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Expenses</h1>
          <p className={`${textMuted} mt-1 text-sm`}>{items.length} entries · {fmt(total)} total</p>
        </div>
        <Button onClick={openAdd} className="bg-[#C9A84C] hover:bg-[#b8963f] text-[#1A1A2E] font-semibold rounded-xl gap-2">
          <Plus size={16} /> Add
        </Button>
      </div>

      <div className={`rounded-2xl border divide-y ${card} ${dark ? "divide-white/5" : "divide-[#F0EDE8]"}`}>
        {loading && <div className={`text-center py-12 ${textMuted}`}>Loading...</div>}
        {!loading && items.length === 0 && (
          <div className="text-center py-16">
            <CreditCard size={40} className={`mx-auto mb-3 ${dark ? "text-white/10" : "text-[#E8E6E1]"}`} />
            <p className={textMuted}>No expenses yet. Add your first!</p>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between px-5 py-4 group">
            <div>
              <p className={`font-medium text-sm ${textPrimary}`}>{item.title}</p>
              <p className={`text-xs mt-0.5 ${textMuted}`}>{item.date} · {CAT_LABELS[item.category] || item.category}{item.recurring ? ` · ${item.recurrence}` : ""}{item.bank_account_name ? ` · ${item.bank_account_name}` : ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-red-400">-{fmt(item.amount)}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className={`p-1.5 rounded-lg ${dark ? "hover:bg-white/10" : "hover:bg-[#F8F7F4]"}`}>
                  <Pencil size={13} className={textMuted} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <FormModal title={editingId ? "Edit Expense" : "Add Expense"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitting={submitting}>
          <Field label="Title">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Rent, Groceries" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount">
              <Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" required />
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </Field>
          </div>
          <Field label="Category">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </Select>
          </Field>
          <Field label="Recurrence">
            <Select value={form.recurrence} onChange={e => setForm(f => ({ ...f, recurrence: e.target.value, recurring: e.target.value !== "one-time" }))}>
              {RECURRENCES.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="From Bank Account (optional)">
            <Select value={form.bank_account_id} onChange={e => handleBankChange(e.target.value)}>
              <option value="">— None —</option>
              {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name} ({b.institution})</option>)}
            </Select>
          </Field>
          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes..." />
          </Field>
        </FormModal>
      )}
    </div>
  );
}
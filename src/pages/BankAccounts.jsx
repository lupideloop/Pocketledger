import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Building2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/finance/FormModal";
import { Field, Input, Select, Textarea } from "@/components/finance/FieldGroup";
import { format } from "date-fns";

const TYPES = ["checking", "savings", "money_market", "cd", "other"];
const TYPE_LABELS = { checking: "Checking", savings: "Savings", money_market: "Money Market", cd: "CD", other: "Other" };
const TYPE_COLORS = { checking: "bg-blue-100 text-blue-700", savings: "bg-green-100 text-green-700", money_market: "bg-purple-100 text-purple-700", cd: "bg-amber-100 text-amber-700", other: "bg-gray-100 text-gray-600" };

const fmt = (n) => "$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const empty = { name: "", institution: "", account_type: "checking", balance: "", interest_rate: "", notes: "", last_updated: format(new Date(), "yyyy-MM-dd") };

export default function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const load = () => base44.entities.BankAccount.list().then(d => { setAccounts(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditingId(null); setShowModal(true); };
  const openEdit = (a) => { setForm({ ...a, balance: a.balance ?? "", interest_rate: a.interest_rate ?? "" }); setEditingId(a.id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = { ...form, balance: parseFloat(form.balance), interest_rate: form.interest_rate ? parseFloat(form.interest_rate) : null };
    if (editingId) await base44.entities.BankAccount.update(editingId, data);
    else await base44.entities.BankAccount.create(data);
    await load();
    setShowModal(false);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.BankAccount.delete(id);
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const total = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E]">Bank Accounts</h1>
          <p className="text-[#8A8A99] mt-1">{accounts.length} accounts · {fmt(total)} total</p>
        </div>
        <Button onClick={openAdd} className="bg-[#1A1A2E] hover:bg-[#16213E] text-white rounded-xl gap-2">
          <Plus size={16} /> Add Account
        </Button>
      </div>

      {/* Summary card */}
      {accounts.length > 0 && (
        <div className="bg-[#1A1A2E] rounded-2xl p-6 text-white">
          <p className="text-white/50 text-sm mb-1">Total Bank Balance</p>
          <p className="text-4xl font-bold text-[#C9A84C]">{fmt(total)}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <div className="col-span-3 text-center py-12 text-[#8A8A99]">Loading...</div>}
        {!loading && accounts.length === 0 && (
          <div className="col-span-3 text-center py-16">
            <Building2 size={40} className="mx-auto text-[#E8E6E1] mb-3" />
            <p className="text-[#8A8A99]">No bank accounts yet. Add your first!</p>
          </div>
        )}
        {accounts.map(a => (
          <div key={a.id} className="bg-white rounded-2xl p-6 border border-[#E8E6E1] hover:shadow-lg transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 size={18} className="text-blue-500" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg">
                  <Pencil size={13} className="text-[#8A8A99]" />
                </button>
                <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
            <p className="font-bold text-[#1A1A2E] text-lg">{a.name}</p>
            <p className="text-[#8A8A99] text-sm mb-3">{a.institution}</p>
            <p className="text-2xl font-bold text-[#1A1A2E]">{fmt(a.balance)}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[a.account_type]}`}>{TYPE_LABELS[a.account_type]}</span>
              {a.interest_rate && <span className="text-xs text-[#8A8A99]">{a.interest_rate}% APY</span>}
            </div>
            {a.last_updated && <p className="text-xs text-[#8A8A99] mt-2">Updated {a.last_updated}</p>}
          </div>
        ))}
      </div>

      {showModal && (
        <FormModal title={editingId ? "Edit Account" : "Add Bank Account"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitting={submitting}>
          <Field label="Account Name">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Checking" required />
          </Field>
          <Field label="Institution">
            <Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} placeholder="e.g. Chase, Bank of America" required />
          </Field>
          <Field label="Account Type">
            <Select value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}>
              {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Balance ($)">
              <Input type="number" step="0.01" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} placeholder="0.00" required />
            </Field>
            <Field label="Interest Rate (%)">
              <Input type="number" step="0.01" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} placeholder="0.00" />
            </Field>
          </div>
          <Field label="Last Updated">
            <Input type="date" value={form.last_updated} onChange={e => setForm(f => ({ ...f, last_updated: e.target.value }))} />
          </Field>
          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes..." />
          </Field>
        </FormModal>
      )}
    </div>
  );
}
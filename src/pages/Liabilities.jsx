import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Landmark, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/finance/FormModal";
import ConfirmDialog from "@/components/finance/ConfirmDialog";
import { Field, Input, Select, Textarea } from "@/components/finance/FieldGroup";
import { useTheme } from "@/components/finance/ThemeContext";

const CATEGORIES = ["mortgage", "car_loan", "student_loan", "credit_card", "personal_loan", "medical", "tax_debt", "other"];
const CAT_LABELS = { mortgage: "Mortgage", car_loan: "Car Loan", student_loan: "Student Loan", credit_card: "Credit Card", personal_loan: "Personal Loan", medical: "Medical", tax_debt: "Tax Debt", other: "Other" };
const CAT_COLORS = { mortgage: "bg-blue-100 text-blue-700", car_loan: "bg-green-100 text-green-700", student_loan: "bg-purple-100 text-purple-700", credit_card: "bg-orange-100 text-orange-700", personal_loan: "bg-yellow-100 text-yellow-700", medical: "bg-pink-100 text-pink-700", tax_debt: "bg-red-100 text-red-700", other: "bg-gray-100 text-gray-600" };
const empty = { name: "", category: "mortgage", current_balance: "", original_amount: "", interest_rate: "", minimum_payment: "", due_date: "", notes: "" };

export default function Liabilities() {
  const { dark, fmt } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => base44.entities.Liability.list().then(d => { setItems(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditingId(null); setShowModal(true); };
  const openEdit = (item) => {
    setForm({
      ...item,
      current_balance: item.current_balance ?? "",
      original_amount: item.original_amount ?? "",
      interest_rate: item.interest_rate ?? "",
      minimum_payment: item.minimum_payment ?? "",
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      ...form,
      current_balance: parseFloat(form.current_balance),
      original_amount: form.original_amount ? parseFloat(form.original_amount) : null,
      interest_rate: form.interest_rate ? parseFloat(form.interest_rate) : null,
      minimum_payment: form.minimum_payment ? parseFloat(form.minimum_payment) : null,
    };
    if (editingId) await base44.entities.Liability.update(editingId, data);
    else await base44.entities.Liability.create(data);
    await load();
    setShowModal(false);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    setConfirmDelete(null);
    await base44.entities.Liability.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const total = items.reduce((s, i) => s + (i.current_balance || 0), 0);
  const totalOriginal = items.reduce((s, i) => s + (i.original_amount || i.current_balance || 0), 0);
  const totalPaidDown = totalOriginal - total;
  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Liabilities</h1>
          <p className={`${textMuted} mt-1 text-sm`}>{items.length} debts · {fmt(total)} total owed</p>
        </div>
        <Button onClick={openAdd} className="bg-[#C9A84C] hover:bg-[#b8963f] text-[#1A1A2E] font-semibold rounded-xl gap-2">
          <Plus size={16} /> Add
        </Button>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1A1A2E] rounded-2xl p-5 text-white">
            <p className="text-white/50 text-sm mb-1">Total Liabilities</p>
            <p className="text-2xl font-bold text-red-400">{fmt(total)}</p>
          </div>
          <div className={`rounded-2xl p-5 border ${card}`}>
            <p className={`text-sm mb-1 ${textMuted}`}>Total Paid Down</p>
            <p className="text-2xl font-bold text-green-500">
              {fmt(totalPaidDown)}
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <div className={`col-span-3 text-center py-12 ${textMuted}`}>Loading...</div>}
        {!loading && items.length === 0 && (
          <div className="col-span-3 text-center py-16">
            <Landmark size={40} className={`mx-auto mb-3 ${dark ? "text-white/10" : "text-[#E8E6E1]"}`} />
            <p className={textMuted}>No liabilities tracked yet. Add your first!</p>
          </div>
        )}
        {items.map(item => {
          const paid = item.original_amount ? item.original_amount - item.current_balance : null;
          return (
            <div key={item.id} className={`rounded-2xl p-5 border hover:shadow-lg transition-shadow group ${card}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? "bg-white/5" : "bg-[#F8F7F4]"}`}>
                  <Landmark size={18} className="text-red-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className={`p-1.5 rounded-lg ${dark ? "hover:bg-white/10" : "hover:bg-[#F8F7F4]"}`}>
                    <Pencil size={13} className={textMuted} />
                  </button>
                  <button onClick={() => setConfirmDelete(item)} className="p-1.5 hover:bg-red-50 rounded-lg">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>
              <p className={`font-bold text-lg ${textPrimary}`}>{item.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[item.category]}`}>{CAT_LABELS[item.category]}</span>
              <p className={`text-2xl font-bold mt-3 text-red-400`}>{fmt(item.current_balance)}</p>
              {item.original_amount && <p className={`text-xs mt-1 ${textMuted}`}>Original: {fmt(item.original_amount)}</p>}
              {paid != null && (
                <p className="text-sm font-medium mt-1 text-green-500">
                  {fmt(paid)} paid down
                </p>
              )}
              {item.interest_rate != null && <p className={`text-xs mt-1 ${textMuted}`}>{item.interest_rate}% APR</p>}
              {item.minimum_payment != null && <p className={`text-xs mt-1 ${textMuted}`}>Min: {fmt(item.minimum_payment)}/mo</p>}
              {item.due_date && <p className={`text-xs mt-1 ${textMuted}`}>Due {item.due_date}</p>}
            </div>
          );
        })}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this liability?"
          message={`"${confirmDelete.name}" will be permanently removed.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showModal && (
        <FormModal title={editingId ? "Edit Liability" : "Add Liability"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitting={submitting}>
          <Field label="Name">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mortgage, Car Loan, Visa Card" required />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Current Balance">
              <Input type="number" step="0.01" value={form.current_balance} onChange={e => setForm(f => ({ ...f, current_balance: e.target.value }))} placeholder="0" required />
            </Field>
            <Field label="Original Amount">
              <Input type="number" step="0.01" value={form.original_amount} onChange={e => setForm(f => ({ ...f, original_amount: e.target.value }))} placeholder="0" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Interest Rate (APR %)">
              <Input type="number" step="0.01" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} placeholder="e.g. 4.5" />
            </Field>
            <Field label="Min. Monthly Payment">
              <Input type="number" step="0.01" value={form.minimum_payment} onChange={e => setForm(f => ({ ...f, minimum_payment: e.target.value }))} placeholder="0" />
            </Field>
          </div>
          <Field label="Next Due Date">
            <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </Field>
          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes..." />
          </Field>
        </FormModal>
      )}
    </div>
  );
}
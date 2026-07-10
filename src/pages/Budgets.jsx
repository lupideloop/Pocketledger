import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Pencil, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/finance/FormModal";
import ConfirmDialog from "@/components/finance/ConfirmDialog";
import { Field, Input, Select, Textarea } from "@/components/finance/FieldGroup";
import { useTheme } from "@/components/finance/ThemeContext";
import FormError from "@/components/finance/FormError";
import LoadingSkeleton from "@/components/finance/LoadingSkeleton";
import { toast } from "@/components/ui/use-toast";

const CATEGORIES = ["housing","food","transport","utilities","healthcare","entertainment","shopping","education","insurance","savings","debt","other"];
const CAT_LABELS = { housing:"Housing", food:"Food", transport:"Transport", utilities:"Utilities", healthcare:"Healthcare", entertainment:"Entertainment", shopping:"Shopping", education:"Education", insurance:"Insurance", savings:"Savings", debt:"Debt", other:"Other" };
const CAT_COLORS = { housing:"bg-blue-500", food:"bg-orange-500", transport:"bg-yellow-500", utilities:"bg-cyan-500", healthcare:"bg-green-500", entertainment:"bg-purple-500", shopping:"bg-pink-500", education:"bg-indigo-500", insurance:"bg-teal-500", savings:"bg-emerald-500", debt:"bg-red-500", other:"bg-gray-500" };

const thisMonth = () => new Date().toISOString().slice(0, 7);
const empty = { category: "food", monthly_limit: "", month: thisMonth(), notes: "" };

export default function Budgets() {
  const { dark, fmt } = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(thisMonth());
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    const [b, e] = await Promise.all([
      base44.entities.Budget.list(),
      base44.entities.Expense.list("-date", 5000),
    ]);
    setBudgets(b);
    setExpenses(e);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ ...empty, month: selectedMonth }); setEditingId(null); setSaveError(""); setShowModal(true); };
  const openEdit = (b) => { setForm({ ...b, monthly_limit: b.monthly_limit ?? "" }); setEditingId(b.id); setSaveError(""); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = { ...form, monthly_limit: parseFloat(form.monthly_limit) };
    setSaveError("");
    const duplicate = budgets.find(item => item.id !== editingId && item.category === data.category && item.month === data.month);
    if (duplicate) {
      setSaveError("A budget already exists for this category and month.");
      setSubmitting(false);
      return;
    }
    try {
      if (editingId) await base44.entities.Budget.update(editingId, data);
      else await base44.entities.Budget.create(data);
      await load();
      setShowModal(false);
      toast({ title: editingId ? "Budget updated" : "Budget saved" });
    } catch (error) {
      setSaveError(error.message || "Unable to save this budget.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDelete(null);
    await base44.entities.Budget.delete(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
    toast({ title: "Budget deleted" });
  };

  const monthBudgets = budgets.filter(b => b.month === selectedMonth);

  const spentByCategory = expenses
    .filter(e => e.date && e.date.slice(0, 7) === selectedMonth)
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
      return acc;
    }, {});

  const totalBudgeted = monthBudgets.reduce((s, b) => s + (b.monthly_limit || 0), 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0);

  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Budgets</h1>
          <p className={`${textMuted} mt-1 text-sm`}>{monthBudgets.length} categories budgeted</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all ${dark ? "bg-[#0F0F1A] border-white/10 text-white" : "bg-[#F8F7F4] border-[#E8E6E1] text-[#1A1A2E]"}`}
          />
          <Button onClick={openAdd} className="bg-[#C9A84C] hover:bg-[#b8963f] text-[#1A1A2E] font-semibold rounded-xl gap-2">
            <Plus size={16} /> Add
          </Button>
        </div>
      </div>

      {/* Summary */}
      {monthBudgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1A1A2E] rounded-2xl p-4 text-white">
            <p className="text-white/50 text-xs mb-1">Total Budgeted</p>
            <p className="text-xl font-bold text-[#C9A84C]">{fmt(totalBudgeted)}</p>
          </div>
          <div className={`rounded-2xl p-4 border ${card}`}>
            <p className={`text-xs mb-1 ${textMuted}`}>Total Spent</p>
            <p className={`text-xl font-bold ${totalSpent > totalBudgeted ? "text-red-500" : "text-green-500"}`}>{fmt(totalSpent)}</p>
          </div>
          <div className={`rounded-2xl p-4 border ${card}`}>
            <p className={`text-xs mb-1 ${textMuted}`}>Remaining</p>
            <p className={`text-xl font-bold ${totalBudgeted - totalSpent < 0 ? "text-red-500" : textPrimary}`}>{fmt(totalBudgeted - totalSpent)}</p>
          </div>
        </div>
      )}

      {/* Budget cards */}
      <div className="space-y-3">
        {loading && <div className={textMuted}><LoadingSkeleton variant="list" count={4} /></div>}
        {!loading && monthBudgets.length === 0 && (
          <div className="text-center py-16">
            <Target size={40} className={`mx-auto mb-3 ${dark ? "text-white/10" : "text-[#E8E6E1]"}`} />
            <p className={textMuted}>No budgets for this month. Add your first!</p>
          </div>
        )}
        {monthBudgets.map(b => {
          const spent = spentByCategory[b.category] || 0;
          const pct = b.monthly_limit > 0 ? Math.min((spent / b.monthly_limit) * 100, 100) : 0;
          const over = b.monthly_limit > 0 && spent > b.monthly_limit;
          const remaining = b.monthly_limit - spent;
          const barColor = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-yellow-500" : CAT_COLORS[b.category] || "bg-[#C9A84C]";

          return (
            <div key={b.id} className={`rounded-2xl p-5 border group ${card}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${CAT_COLORS[b.category] || "bg-gray-400"}`} />
                  <span className={`font-semibold text-sm ${textPrimary}`}>{CAT_LABELS[b.category] || b.category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium ${over ? "text-red-400" : textMuted}`}>
                    {fmt(spent)} / {fmt(b.monthly_limit)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(b)} aria-label={`Edit ${CAT_LABELS[b.category] || b.category} budget`} className={`h-11 w-11 flex items-center justify-center rounded-lg ${dark ? "hover:bg-white/10" : "hover:bg-[#F8F7F4]"}`}>
                      <Pencil size={16} className={textMuted} />
                    </button>
                    <button onClick={() => setConfirmDelete(b)} aria-label={`Delete ${CAT_LABELS[b.category] || b.category} budget`} className="h-11 w-11 flex items-center justify-center hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className={`w-full h-2.5 rounded-full ${dark ? "bg-white/10" : "bg-[#F0EDE8]"}`}>
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between mt-2">
                <span className={`text-xs ${textMuted}`}>{pct.toFixed(0)}% used</span>
                <span className={`text-xs font-medium ${over ? "text-red-400" : "text-green-500"}`}>
                  {over ? `${fmt(Math.abs(remaining))} over budget` : `${fmt(remaining)} left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this budget?"
          message={`The ${CAT_LABELS[confirmDelete.category] || confirmDelete.category} budget for ${confirmDelete.month} will be permanently removed.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showModal && (
        <FormModal title={editingId ? "Edit Budget" : "Add Budget"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitting={submitting}>
          <Field label="Category">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </Select>
          </Field>
          <Field label="Monthly Limit">
            <Input type="number" step="1" value={form.monthly_limit} onChange={e => setForm(f => ({ ...f, monthly_limit: e.target.value }))} placeholder="0" required />
          </Field>
          <Field label="Month">
            <Input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} required />
          </Field>
          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes..." />
          </Field>
          <FormError message={saveError} />
        </FormModal>
      )}
    </div>
  );
}
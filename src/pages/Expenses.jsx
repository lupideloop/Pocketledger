import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, CreditCard, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/finance/FormModal";
import { Field, Input, Select, Textarea } from "@/components/finance/FieldGroup";
import { format } from "date-fns";

const CATEGORIES = ["housing", "food", "transport", "utilities", "healthcare", "entertainment", "shopping", "education", "insurance", "savings", "debt", "other"];

const CATEGORY_COLORS = {
  housing: "bg-blue-100 text-blue-700", food: "bg-emerald-100 text-emerald-700",
  transport: "bg-amber-100 text-amber-700", utilities: "bg-purple-100 text-purple-700",
  healthcare: "bg-red-100 text-red-700", entertainment: "bg-pink-100 text-pink-700",
  shopping: "bg-cyan-100 text-cyan-700", education: "bg-lime-100 text-lime-700",
  insurance: "bg-indigo-100 text-indigo-700", savings: "bg-teal-100 text-teal-700",
  debt: "bg-orange-100 text-orange-700", other: "bg-gray-100 text-gray-600"
};

const fmt = (n) => "$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const empty = { title: "", amount: "", category: "other", date: format(new Date(), "yyyy-MM-dd"), notes: "", recurring: false, recurrence: "one-time" };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const load = () => base44.entities.Expense.list("-date", 200).then(data => { setExpenses(data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.Expense.create({ ...form, amount: parseFloat(form.amount) });
    await load();
    setShowModal(false);
    setForm(empty);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Expense.delete(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const filtered = filterCategory === "all" ? expenses : expenses.filter(e => e.category === filterCategory);
  const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E]">Expenses</h1>
          <p className="text-[#8A8A99] mt-1">{filtered.length} transactions · {fmt(total)} total</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-[#1A1A2E] hover:bg-[#16213E] text-white rounded-xl gap-2">
          <Plus size={16} /> Add Expense
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {["all", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${filterCategory === cat ? "bg-[#1A1A2E] text-white" : "bg-white border border-[#E8E6E1] text-[#8A8A99] hover:border-[#C9A84C]"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading && <div className="text-center py-12 text-[#8A8A99]">Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <CreditCard size={40} className="mx-auto text-[#E8E6E1] mb-3" />
            <p className="text-[#8A8A99]">No expenses yet. Add your first one!</p>
          </div>
        )}
        {filtered.map(expense => (
          <div key={expense.id} className="bg-white rounded-2xl p-5 border border-[#E8E6E1] flex items-center justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#F8F7F4] flex items-center justify-center">
                <Tag size={16} className="text-[#8A8A99]" />
              </div>
              <div>
                <p className="font-semibold text-[#1A1A2E]">{expense.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${CATEGORY_COLORS[expense.category]}`}>
                    {expense.category}
                  </span>
                  <span className="text-xs text-[#8A8A99]">{expense.date}</span>
                  {expense.recurring && <span className="text-xs bg-[#F8F7F4] text-[#8A8A99] px-2 py-0.5 rounded-full">{expense.recurrence}</span>}
                </div>
                {expense.notes && <p className="text-xs text-[#8A8A99] mt-1">{expense.notes}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-bold text-[#1A1A2E] text-lg">{fmt(expense.amount)}</p>
              <button
                onClick={() => handleDelete(expense.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <FormModal title="Add Expense" onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitting={submitting}>
          <Field label="Title">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Rent, Groceries" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount ($)">
              <Input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" required />
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </Field>
          </div>
          <Field label="Category">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Recurring?">
              <Select value={form.recurring ? "yes" : "no"} onChange={e => setForm(f => ({ ...f, recurring: e.target.value === "yes" }))}>
                <option value="no">One-time</option>
                <option value="yes">Recurring</option>
              </Select>
            </Field>
            {form.recurring && (
              <Field label="Frequency">
                <Select value={form.recurrence} onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </Field>
            )}
          </div>
          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes..." />
          </Field>
        </FormModal>
      )}
    </div>
  );
}
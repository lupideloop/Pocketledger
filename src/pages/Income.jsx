import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/finance/FormModal";
import { Field, Input, Select, Textarea } from "@/components/finance/FieldGroup";
import { useTheme } from "@/components/finance/ThemeContext";
import { format } from "date-fns";

const CATEGORIES = ["salary", "freelance", "business", "rental", "investment", "dividends", "bonus", "gift", "other"];
const CAT_COLORS = {
  salary: "bg-green-100 text-green-700", freelance: "bg-blue-100 text-blue-700",
  business: "bg-purple-100 text-purple-700", rental: "bg-amber-100 text-amber-700",
  investment: "bg-teal-100 text-teal-700", dividends: "bg-cyan-100 text-cyan-700",
  bonus: "bg-yellow-100 text-yellow-700", gift: "bg-pink-100 text-pink-700",
  other: "bg-gray-100 text-gray-600"
};
const fmt = (n) => "$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const empty = { source: "", amount: "", category: "salary", date: format(new Date(), "yyyy-MM-dd"), recurring: false, recurrence: "monthly", notes: "" };

export default function Income() {
  const { dark } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const load = () => base44.entities.Income.list("-date", 200).then(d => { setItems(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.Income.create({ ...form, amount: parseFloat(form.amount) });
    await load();
    setShowModal(false);
    setForm(empty);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Income.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const filtered = filterCat === "all" ? items : items.filter(i => i.category === filterCat);
  const total = filtered.reduce((s, i) => s + (i.amount || 0), 0);

  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";
  const pill = (active) => active
    ? "bg-[#C9A84C] text-[#1A1A2E]"
    : dark ? "bg-[#1E1E30] border border-white/10 text-white/40 hover:text-white/70" : "bg-white border border-[#E8E6E1] text-[#8A8A99] hover:border-[#C9A84C]";

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Income</h1>
          <p className={`${textMuted} mt-1 text-sm`}>{filtered.length} entries · {fmt(total)} total</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-[#C9A84C] hover:bg-[#b8963f] text-[#1A1A2E] font-semibold rounded-xl gap-2">
          <Plus size={16} /> Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${pill(filterCat === cat)}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && <div className={`text-center py-12 ${textMuted}`}>Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Wallet size={40} className={`mx-auto mb-3 ${dark ? "text-white/10" : "text-[#E8E6E1]"}`} />
            <p className={textMuted}>No income recorded yet. Add your first!</p>
          </div>
        )}
        {filtered.map(item => (
          <div key={item.id} className={`rounded-2xl p-4 border flex items-center justify-between group hover:shadow-md transition-shadow ${card}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Wallet size={15} className="text-green-500" />
              </div>
              <div className="min-w-0">
                <p className={`font-semibold text-sm truncate ${textPrimary}`}>{item.source}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${CAT_COLORS[item.category]}`}>{item.category}</span>
                  <span className={`text-xs ${textMuted}`}>{item.date}</span>
                  {item.recurring && <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? "bg-white/5 text-white/30" : "bg-[#F8F7F4] text-[#8A8A99]"}`}>{item.recurrence}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <p className="font-bold text-green-500 text-base">{fmt(item.amount)}</p>
              <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 size={13} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <FormModal title="Add Income" onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitting={submitting}>
          <Field label="Source">
            <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="e.g. Employer, Freelance Client" required />
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
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
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
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </Field>
            )}
          </div>
          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes..." />
          </Field>
        </FormModal>
      )}
    </div>
  );
}
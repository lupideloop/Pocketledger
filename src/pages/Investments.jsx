import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Pencil, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/finance/FormModal";
import { Field, Input, Select, Textarea } from "@/components/finance/FieldGroup";
import { useTheme } from "@/components/finance/ThemeContext";

const ACCOUNT_TYPES = ["brokerage","401k","ira","roth_ira","529","hsa","crypto","other"];
const TYPE_LABELS = { brokerage:"Brokerage", "401k":"401(k)", ira:"IRA", roth_ira:"Roth IRA", "529":"529 Plan", hsa:"HSA", crypto:"Crypto", other:"Other" };
const TYPE_COLORS = { brokerage:"bg-blue-100 text-blue-700", "401k":"bg-green-100 text-green-700", ira:"bg-purple-100 text-purple-700", roth_ira:"bg-indigo-100 text-indigo-700", "529":"bg-yellow-100 text-yellow-700", hsa:"bg-teal-100 text-teal-700", crypto:"bg-orange-100 text-orange-700", other:"bg-gray-100 text-gray-600" };
const empty = { name:"", institution:"", account_type:"brokerage", balance:"", contributions:"", gain_loss:"", notes:"", last_updated: new Date().toISOString().split("T")[0] };

export default function Investments() {
  const { dark, fmt } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const load = () => base44.entities.InvestmentAccount.list().then(d => { setItems(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditingId(null); setShowModal(true); };
  const openEdit = (item) => { setForm({ ...item, balance: item.balance ?? "", contributions: item.contributions ?? "", gain_loss: item.gain_loss ?? "" }); setEditingId(item.id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      ...form,
      balance: parseFloat(form.balance),
      contributions: form.contributions ? parseFloat(form.contributions) : null,
      gain_loss: form.gain_loss ? parseFloat(form.gain_loss) : null,
    };
    if (editingId) await base44.entities.InvestmentAccount.update(editingId, data);
    else await base44.entities.InvestmentAccount.create(data);
    await load();
    setShowModal(false);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.InvestmentAccount.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const total = items.reduce((s, i) => s + (i.balance || 0), 0);
  const totalGainLoss = items.reduce((s, i) => s + (i.gain_loss || 0), 0);
  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Investments</h1>
          <p className={`${textMuted} mt-1 text-sm`}>{items.length} accounts · {fmt(total)} total value</p>
        </div>
        <Button onClick={openAdd} className="bg-[#C9A84C] hover:bg-[#b8963f] text-[#1A1A2E] font-semibold rounded-xl gap-2">
          <Plus size={16} /> Add
        </Button>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1A1A2E] rounded-2xl p-5 text-white">
            <p className="text-white/50 text-sm mb-1">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-[#C9A84C]">{fmt(total)}</p>
          </div>
          <div className={`rounded-2xl p-5 border ${card}`}>
            <p className={`text-sm mb-1 ${textMuted}`}>Total Gain / Loss</p>
            <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalGainLoss >= 0 ? "+" : ""}{fmt(totalGainLoss)}
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <div className={`col-span-3 text-center py-12 ${textMuted}`}>Loading...</div>}
        {!loading && items.length === 0 && (
          <div className="col-span-3 text-center py-16">
            <TrendingUp size={40} className={`mx-auto mb-3 ${dark ? "text-white/10" : "text-[#E8E6E1]"}`} />
            <p className={textMuted}>No investment accounts yet. Add your first!</p>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className={`rounded-2xl p-5 border hover:shadow-lg transition-shadow group ${card}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? "bg-white/5" : "bg-[#F8F7F4]"}`}>
                <TrendingUp size={18} className="text-[#C9A84C]" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className={`p-1.5 rounded-lg ${dark ? "hover:bg-white/10" : "hover:bg-[#F8F7F4]"}`}>
                  <Pencil size={13} className={textMuted} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
            <p className={`font-bold text-lg ${textPrimary}`}>{item.name}</p>
            <p className={`text-xs ${textMuted} mb-2`}>{item.institution}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[item.account_type]}`}>{TYPE_LABELS[item.account_type]}</span>
            <p className={`text-2xl font-bold mt-3 ${textPrimary}`}>{fmt(item.balance)}</p>
            {item.contributions != null && <p className={`text-xs mt-1 ${textMuted}`}>Contributions: {fmt(item.contributions)}</p>}
            {item.gain_loss != null && (
              <p className={`text-sm font-medium mt-1 ${item.gain_loss >= 0 ? "text-green-500" : "text-red-500"}`}>
                {item.gain_loss >= 0 ? "+" : ""}{fmt(item.gain_loss)} gain/loss
              </p>
            )}
            {item.last_updated && <p className={`text-xs mt-1 ${textMuted}`}>Updated {item.last_updated}</p>}
          </div>
        ))}
      </div>

      {showModal && (
        <FormModal title={editingId ? "Edit Account" : "Add Account"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitting={submitting}>
          <Field label="Account Name">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. My Roth IRA" required />
          </Field>
          <Field label="Institution">
            <Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} placeholder="e.g. Fidelity, Vanguard" required />
          </Field>
          <Field label="Account Type">
            <Select value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}>
              {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Current Value">
              <Input type="number" step="0.01" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} placeholder="0" required />
            </Field>
            <Field label="Contributions">
              <Input type="number" step="0.01" value={form.contributions} onChange={e => setForm(f => ({ ...f, contributions: e.target.value }))} placeholder="0" />
            </Field>
          </div>
          <Field label="Gain / Loss">
            <Input type="number" step="0.01" value={form.gain_loss} onChange={e => setForm(f => ({ ...f, gain_loss: e.target.value }))} placeholder="0" />
          </Field>
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
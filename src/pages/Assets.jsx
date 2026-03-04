import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, BarChart3, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/finance/FormModal";
import { Field, Input, Select, Textarea } from "@/components/finance/FieldGroup";
import { useTheme } from "@/components/finance/ThemeContext";

const CATEGORIES = ["real_estate", "vehicle", "jewelry", "art", "collectibles", "business", "other"];
const CAT_LABELS = { real_estate: "Real Estate", vehicle: "Vehicle", jewelry: "Jewelry", art: "Art", collectibles: "Collectibles", business: "Business", other: "Other" };
const CAT_COLORS = { real_estate: "bg-blue-100 text-blue-700", vehicle: "bg-green-100 text-green-700", jewelry: "bg-yellow-100 text-yellow-700", art: "bg-purple-100 text-purple-700", collectibles: "bg-pink-100 text-pink-700", business: "bg-orange-100 text-orange-700", other: "bg-gray-100 text-gray-600" };
const empty = { name: "", category: "real_estate", current_value: "", purchase_price: "", purchase_date: "", notes: "" };

export default function Assets() {
  const { dark } = useTheme();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const load = () => base44.entities.Asset.list().then(d => { setAssets(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditingId(null); setShowModal(true); };
  const openEdit = (a) => { setForm({ ...a, current_value: a.current_value ?? "", purchase_price: a.purchase_price ?? "" }); setEditingId(a.id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = { ...form, current_value: parseFloat(form.current_value), purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null };
    if (editingId) await base44.entities.Asset.update(editingId, data);
    else await base44.entities.Asset.create(data);
    await load();
    setShowModal(false);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Asset.delete(id);
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const total = assets.reduce((s, a) => s + (a.current_value || 0), 0);
  const totalGain = assets.reduce((s, a) => s + ((a.current_value || 0) - (a.purchase_price || a.current_value || 0)), 0);
  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Assets</h1>
          <p className={`${textMuted} mt-1 text-sm`}>{assets.length} assets · {fmt(total)} total value</p>
        </div>
        <Button onClick={openAdd} className="bg-[#C9A84C] hover:bg-[#b8963f] text-[#1A1A2E] font-semibold rounded-xl gap-2">
          <Plus size={16} /> Add
        </Button>
      </div>

      {assets.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1A1A2E] rounded-2xl p-5 text-white">
            <p className="text-white/50 text-sm mb-1">Total Asset Value</p>
            <p className="text-2xl font-bold text-[#C9A84C]">{fmt(total)}</p>
          </div>
          <div className={`rounded-2xl p-5 border ${card}`}>
            <p className={`text-sm mb-1 ${textMuted}`}>Total Appreciation</p>
            <p className={`text-2xl font-bold ${totalGain >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalGain >= 0 ? "+" : ""}{fmt(totalGain)}
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <div className={`col-span-3 text-center py-12 ${textMuted}`}>Loading...</div>}
        {!loading && assets.length === 0 && (
          <div className="col-span-3 text-center py-16">
            <BarChart3 size={40} className={`mx-auto mb-3 ${dark ? "text-white/10" : "text-[#E8E6E1]"}`} />
            <p className={textMuted}>No assets yet. Add your first!</p>
          </div>
        )}
        {assets.map(a => {
          const gain = a.purchase_price ? a.current_value - a.purchase_price : null;
          return (
            <div key={a.id} className={`rounded-2xl p-5 border hover:shadow-lg transition-shadow group ${card}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? "bg-white/5" : "bg-[#F8F7F4]"}`}>
                  <BarChart3 size={18} className="text-[#C9A84C]" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(a)} className={`p-1.5 rounded-lg ${dark ? "hover:bg-white/10" : "hover:bg-[#F8F7F4]"}`}>
                    <Pencil size={13} className={textMuted} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>
              <p className={`font-bold text-lg ${textPrimary}`}>{a.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[a.category]}`}>{CAT_LABELS[a.category]}</span>
              <p className={`text-2xl font-bold mt-3 ${textPrimary}`}>{fmt(a.current_value)}</p>
              {a.purchase_price && <p className={`text-xs mt-1 ${textMuted}`}>Purchased for {fmt(a.purchase_price)}</p>}
              {gain != null && (
                <p className={`text-sm font-medium mt-1 ${gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {gain >= 0 ? "+" : ""}{fmt(gain)} appreciation
                </p>
              )}
              {a.purchase_date && <p className={`text-xs mt-1 ${textMuted}`}>Acquired {a.purchase_date}</p>}
            </div>
          );
        })}
      </div>

      {showModal && (
        <FormModal title={editingId ? "Edit Asset" : "Add Asset"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitting={submitting}>
          <Field label="Asset Name">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Primary Residence, Tesla Model 3" required />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Current Value ($)">
              <Input type="number" step="1" value={form.current_value} onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))} placeholder="0" required />
            </Field>
            <Field label="Purchase Price ($)">
              <Input type="number" step="1" value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} placeholder="0" />
            </Field>
          </div>
          <Field label="Purchase Date">
            <Input type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
          </Field>
          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes..." />
          </Field>
        </FormModal>
      )}
    </div>
  );
}
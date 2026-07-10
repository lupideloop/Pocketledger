import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Pencil, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/finance/FormModal";
import ConfirmDialog from "@/components/finance/ConfirmDialog";
import { Field, Input, Select, Textarea } from "@/components/finance/FieldGroup";
import { useTheme } from "@/components/finance/ThemeContext";
import FormError from "@/components/finance/FormError";
import TransactionFilters from "@/components/finance/TransactionFilters";
import ListPagination from "@/components/finance/ListPagination";
import LoadingSkeleton from "@/components/finance/LoadingSkeleton";
import { toast } from "@/components/ui/use-toast";

const CATEGORIES = ["salary","freelance","business","rental","investment","dividends","bonus","gift","other"];
const CAT_LABELS = { salary:"Salary", freelance:"Freelance", business:"Business", rental:"Rental", investment:"Investment", dividends:"Dividends", bonus:"Bonus", gift:"Gift", other:"Other" };
const RECURRENCES = ["one-time","monthly","weekly","bi-weekly","yearly"];
const PAGE_SIZE = 25;
const empty = { source:"", amount:"", category:"salary", date: new Date().toISOString().split("T")[0], notes:"", recurring: false, recurrence:"one-time", bank_account_id:"", bank_account_name:"" };

export default function Income() {
  const { dark, fmt } = useTheme();
  const [items, setItems] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => Promise.all([
    base44.entities.Income.list("-date", 5000),
    base44.entities.BankAccount.list(),
  ]).then(([d, b]) => { setItems(d); setBankAccounts(b); setLoading(false); });

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditingId(null); setEditingItem(null); setSaveError(""); setShowModal(true); };
  const openEdit = (item) => { setForm({ ...item, amount: item.amount ?? "" }); setEditingId(item.id); setEditingItem(item); setSaveError(""); setShowModal(true); };

  const handleBankChange = (id) => {
    const acct = bankAccounts.find(b => b.id === id);
    setForm(f => ({ ...f, bank_account_id: id, bank_account_name: acct ? acct.name : "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSaveError("");
    try {
      await base44.functions.invoke("saveFinancialTransaction", {
        kind: "income",
        action: editingId ? "update" : "create",
        id: editingId,
        data: { ...form, amount: parseFloat(form.amount) },
      });
      await load();
      setShowModal(false);
      toast({ title: editingId ? "Income updated" : "Income saved" });
    } catch (error) {
      setSaveError(error.response?.data?.error || error.message || "Unable to save this income entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    await base44.functions.invoke("saveFinancialTransaction", {
      kind: "income",
      action: "delete",
      id: item.id,
    });
    setConfirmDelete(null);
    await load();
    toast({ title: "Income entry deleted" });
  };

  const total = items.reduce((s, i) => s + (i.amount || 0), 0);
  const query = search.trim().toLowerCase();
  const filteredItems = items.filter(item => (!categoryFilter || item.category === categoryFilter) && (!query || `${item.source} ${item.bank_account_name || ""} ${item.date || ""}`.toLowerCase().includes(query)));
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pageItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Income</h1>
          <p className={`${textMuted} mt-1 text-sm`}>{items.length} entries · {fmt(total)} total</p>
        </div>
        <Button onClick={openAdd} className="bg-[#C9A84C] hover:bg-[#b8963f] text-[#1A1A2E] font-semibold rounded-xl gap-2">
          <Plus size={16} /> Add
        </Button>
      </div>

      <TransactionFilters search={search} onSearch={value => { setSearch(value); setPage(1); }} category={categoryFilter} onCategory={value => { setCategoryFilter(value); setPage(1); }} categories={CATEGORIES} labels={CAT_LABELS} count={filteredItems.length} />

      <div className={`rounded-2xl border divide-y ${card} ${dark ? "divide-white/5" : "divide-[#F0EDE8]"}`}>
        {loading && <div className={`p-4 ${textMuted}`}><LoadingSkeleton variant="list" count={4} /></div>}
        {!loading && items.length === 0 && (
          <div className="text-center py-16">
            <Wallet size={40} className={`mx-auto mb-3 ${dark ? "text-white/10" : "text-[#E8E6E1]"}`} />
            <p className={textMuted}>No income yet. Add your first!</p>
          </div>
        )}
        {!loading && items.length > 0 && filteredItems.length === 0 && <div className={`text-center py-12 text-sm ${textMuted}`}>No income entries match your search.</div>}
        {pageItems.map(item => (
          <div key={item.id} className="flex items-center justify-between px-5 py-4 group">
            <div>
              <p className={`font-medium text-sm ${textPrimary}`}>{item.source}</p>
              <p className={`text-xs mt-0.5 ${textMuted}`}>{item.date} · {CAT_LABELS[item.category] || item.category}{item.recurring ? ` · ${item.recurrence}` : ""}{item.bank_account_name ? ` · ${item.bank_account_name}` : ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-green-400">+{fmt(item.amount)}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} aria-label={`Edit ${item.source}`} className={`h-11 w-11 flex items-center justify-center rounded-lg ${dark ? "hover:bg-white/10" : "hover:bg-[#F8F7F4]"}`}>
                  <Pencil size={16} className={textMuted} />
                </button>
                <button onClick={() => setConfirmDelete(item)} aria-label={`Delete ${item.source}`} className="h-11 w-11 flex items-center justify-center hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ListPagination page={page} pageCount={pageCount} onPage={setPage} />

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this income entry?"
          message={`"${confirmDelete.source}" will be permanently removed.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showModal && (
        <FormModal title={editingId ? "Edit Income" : "Add Income"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitting={submitting}>
          <Field label="Source">
            <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="e.g. Employer, Freelance Client" required />
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
            {form.recurring && <p className="text-xs text-[#8A8A99]">Future occurrences are generated automatically each day.</p>}
          </Field>
          <Field label="Into Bank Account (optional)">
            <Select value={form.bank_account_id} onChange={e => handleBankChange(e.target.value)}>
              <option value="">— None —</option>
              {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name} ({b.institution})</option>)}
            </Select>
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
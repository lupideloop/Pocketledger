import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const blank = () => ({ source_account_id: "", destination_account_id: "", amount: "", date: new Date().toISOString().slice(0, 10), notes: "" });
const PAGE_SIZE = 25;

export default function useTransfers() {
  const [items, setItems] = useState([]), [accounts, setAccounts] = useState([]), [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false), [form, setForm] = useState(blank), [submitting, setSubmitting] = useState(false), [error, setError] = useState("");
  const [search, setSearch] = useState(""), [account, setAccount] = useState(""), [page, setPage] = useState(1), [confirmDelete, setConfirmDelete] = useState(null);
  const load = async () => {
    const [transfers, bankAccounts] = await Promise.all([base44.entities.Transfer.list("-date", 5000), base44.entities.BankAccount.list()]);
    setItems(transfers); setAccounts(bankAccounts); setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const openCreate = () => { setForm(blank()); setError(""); setModal(true); };
  const submit = async (event) => {
    event.preventDefault(); setSubmitting(true); setError("");
    try {
      await base44.functions.invoke("saveTransfer", { action: "create", ...form, amount: Number(form.amount) });
      await load(); setModal(false); toast({ title: "Transfer completed" });
    } catch (err) { setError(err.response?.data?.error || err.message || "Unable to complete transfer."); }
    finally { setSubmitting(false); }
  };
  const remove = async () => {
    try {
      await base44.functions.invoke("saveTransfer", { action: "delete", id: confirmDelete.id });
      setConfirmDelete(null); await load(); toast({ title: "Transfer deleted and balances restored" });
    } catch (err) { toast({ title: "Unable to delete transfer", description: err.response?.data?.error || err.message, variant: "destructive" }); }
  };
  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); return items.filter(item => (!account || item.source_account_id === account || item.destination_account_id === account) && (!q || `${item.source_account_name} ${item.destination_account_name} ${item.notes || ""} ${item.date}`.toLowerCase().includes(q))); }, [items, search, account]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  return { items, accounts, loading, modal, setModal, form, setForm, submitting, error, search, setSearch, account, setAccount, page, setPage, pageCount, pageItems: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), filteredCount: filtered.length, total: items.reduce((sum, item) => sum + Number(item.amount || 0), 0), openCreate, submit, confirmDelete, setConfirmDelete, remove };
}
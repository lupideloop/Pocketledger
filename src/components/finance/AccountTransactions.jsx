import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { useTheme } from "@/components/finance/ThemeContext";
import useAccessibleDialog from "@/hooks/useAccessibleDialog";
import LoadingSkeleton from "@/components/finance/LoadingSkeleton";

export default function AccountTransactions({ account, onClose }) {
  const { dark, fmt } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dialogRef, titleId, close } = useAccessibleDialog(onClose);

  // Handle Android hardware back button
  useEffect(() => {
    const handlePopState = () => close();
    window.history.pushState({ modal: true }, "");
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.modal) window.history.back();
    };
  }, [close]);

  useEffect(() => {
    Promise.all([
      base44.entities.Expense.list("-date", 500),
      base44.entities.Income.list("-date", 500),
    ]).then(([expenses, incomes]) => {
      const exp = expenses
        .filter(e => e.bank_account_id === account.id)
        .map(e => ({ ...e, type: "expense", label: e.title }));
      const inc = incomes
        .filter(i => i.bank_account_id === account.id)
        .map(i => ({ ...i, type: "income", label: i.source }));
      const all = [...exp, ...inc].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setTransactions(all);
      setLoading(false);
    });
  }, [account.id]);

  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const bg = dark ? "bg-[#1E1E30]" : "bg-white";
  const divider = dark ? "divide-white/5" : "divide-[#F0EDE8]";
  const border = dark ? "border-white/10" : "border-[#E8E6E1]";

  const modal = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={`relative rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col ${bg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${border} flex-shrink-0`}>
          <div>
            <h2 id={titleId} className={`text-lg font-semibold ${textPrimary}`}>{account.name}</h2>
            <p className={`text-xs ${textMuted}`}>{account.institution} · Transaction History</p>
          </div>
          <button type="button" onClick={close} aria-label="Close transaction history" className={`h-11 w-11 flex items-center justify-center rounded-lg transition-colors ${dark ? "hover:bg-white/10 text-white/50" : "hover:bg-[#F8F7F4] text-[#8A8A99]"}`}>
            <X size={16} />
          </button>
        </div>

        {/* Balance summary */}
        <div className={`px-5 py-3 border-b ${border} flex-shrink-0`}>
          <p className={`text-xs ${textMuted}`}>Current Balance</p>
          <p className={`text-2xl font-bold text-[#C9A84C]`}>{fmt(account.balance)}</p>
        </div>

        {/* Transaction list */}
        <div className={`overflow-y-auto flex-1 divide-y ${divider}`}>
          {loading && <div className={`p-4 ${textMuted}`}><LoadingSkeleton variant="list" count={4} /></div>}
          {!loading && transactions.length === 0 && (
            <p className={`text-center py-10 ${textMuted} text-sm`}>No transactions linked to this account.</p>
          )}
          {transactions.map(tx => (
            <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "income" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {tx.type === "income"
                    ? <TrendingUp size={14} className="text-green-400" />
                    : <TrendingDown size={14} className="text-red-400" />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${textPrimary}`}>{tx.label}</p>
                  <p className={`text-xs ${textMuted}`}>{tx.date} · {tx.category}</p>
                </div>
              </div>
              <span className={`font-bold text-sm ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
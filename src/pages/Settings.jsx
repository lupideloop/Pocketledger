import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useTheme, CURRENCIES } from "@/components/finance/ThemeContext";
import { User, Trash2, LogOut, AlertTriangle, ChevronRight, Moon, Sun, DollarSign } from "lucide-react";

export default function Settings() {
  const { dark, toggle, currency, changeCurrency } = useTheme();
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";
  const inputCls = `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-all ${dark ? "bg-[#0F0F1A] border-white/10 text-white placeholder-white/20" : "bg-[#F8F7F4] border-[#E8E6E1] text-[#1A1A2E] placeholder-[#C0BDB8]"}`;

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    setDeleting(true);
    // Delete all user data in parallel
    const [expenses, incomes, accounts, investments, assets, budgets, liabilities] = await Promise.all([
      base44.entities.Expense.list("-date", 5000),
      base44.entities.Income.list("-date", 5000),
      base44.entities.BankAccount.list(),
      base44.entities.InvestmentAccount.list(),
      base44.entities.Asset.list(),
      base44.entities.Budget.list(),
      base44.entities.Liability.list(),
    ]);
    await Promise.all([
      ...expenses.map(e => base44.entities.Expense.delete(e.id)),
      ...incomes.map(i => base44.entities.Income.delete(i.id)),
      ...accounts.map(a => base44.entities.BankAccount.delete(a.id)),
      ...investments.map(i => base44.entities.InvestmentAccount.delete(i.id)),
      ...assets.map(a => base44.entities.Asset.delete(a.id)),
      ...budgets.map(b => base44.entities.Budget.delete(b.id)),
      ...liabilities.map(l => base44.entities.Liability.delete(l.id)),
    ]);
    setDeleting(false);
    base44.auth.logout("/");
  };

  const Row = ({ icon: Icon, label, right, onClick, danger }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-4 transition-colors active:opacity-60
        ${danger
          ? dark ? "hover:bg-red-500/10" : "hover:bg-red-50"
          : dark ? "hover:bg-white/5" : "hover:bg-[#F8F7F4]"
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={danger ? "text-red-400" : "text-[#C9A84C]"} />
        <span className={`text-sm font-medium ${danger ? "text-red-400" : textPrimary}`}>{label}</span>
      </div>
      <div className={`flex items-center gap-2 text-sm ${textMuted}`}>
        {right}
        {!danger && <ChevronRight size={14} />}
      </div>
    </button>
  );

  return (
    <div className="p-4 lg:p-8 max-w-lg mx-auto space-y-5">
      <div>
        <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Settings</h1>
        <p className={`${textMuted} mt-1 text-sm`}>Manage your account & preferences</p>
      </div>

      {/* Profile */}
      {user && (
        <div className={`rounded-2xl border ${card} overflow-hidden`}>
          <div className={`px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider ${textMuted} ${dark ? "border-white/5" : "border-[#F0EDE8]"}`}>
            Account
          </div>
          <div className="px-4 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-[#C9A84C]" />
            </div>
            <div className="min-w-0">
              <p className={`font-semibold text-sm truncate ${textPrimary}`}>{user.full_name || "User"}</p>
              <p className={`text-xs truncate ${textMuted}`}>{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Preferences */}
      <div className={`rounded-2xl border ${card} overflow-hidden`}>
        <div className={`px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider ${textMuted} ${dark ? "border-white/5" : "border-[#F0EDE8]"}`}>
          Preferences
        </div>
        <Row
          icon={dark ? Sun : Moon}
          label={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onClick={toggle}
        />
        <div className={`border-t ${dark ? "border-white/5" : "border-[#F0EDE8]"}`} />
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign size={18} className="text-[#C9A84C]" />
            <span className={`text-sm font-medium ${textPrimary}`}>Currency</span>
          </div>
          <select
            value={currency.code}
            onChange={e => changeCurrency(e.target.value)}
            className={`text-sm px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all ${dark ? "bg-[#0F0F1A] border-white/10 text-white" : "bg-[#F8F7F4] border-[#E8E6E1] text-[#1A1A2E]"}`}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Danger zone */}
      <div className={`rounded-2xl border ${card} border-red-400/20 overflow-hidden`}>
        <div className={`px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider text-red-400/60 ${dark ? "border-white/5" : "border-[#F0EDE8]"}`}>
          Danger Zone
        </div>
        <Row
          icon={LogOut}
          label="Log Out"
          onClick={() => base44.auth.logout("/")}
        />
        <div className={`border-t ${dark ? "border-white/5" : "border-[#F0EDE8]"}`} />
        <Row
          icon={Trash2}
          label="Delete Account & All Data"
          onClick={() => setShowDeleteConfirm(true)}
          danger
        />
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }} />
          <div className={`relative rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 space-y-4 ${dark ? "bg-[#1E1E30]" : "bg-white"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h2 className={`font-bold text-base ${textPrimary}`}>Delete Account</h2>
                <p className={`text-xs ${textMuted}`}>This cannot be undone</p>
              </div>
            </div>
            <p className={`text-sm ${textMuted}`}>
              All your expenses, income, accounts, investments, assets, liabilities and budgets will be permanently deleted.
            </p>
            <div>
              <p className={`text-xs mb-2 font-medium ${textMuted}`}>Type <span className="font-bold text-red-400">DELETE</span> to confirm</p>
              <input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className={inputCls}
                autoCapitalize="characters"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white hover:bg-white/5" : "border-[#E8E6E1] text-[#1A1A2E] hover:bg-gray-50"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== "DELETE" || deleting}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? "Deleting…" : "Delete Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
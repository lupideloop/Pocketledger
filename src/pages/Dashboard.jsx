import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/components/finance/ThemeContext";
import { TrendingUp, TrendingDown, Building2, BarChart3, Wallet, CreditCard } from "lucide-react";

export default function Dashboard() {
  const { dark, fmt } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => Promise.all([
    base44.entities.Expense.list("-date", 5000),
    base44.entities.Income.list("-date", 5000),
    base44.entities.BankAccount.list(),
    base44.entities.InvestmentAccount.list(),
    base44.entities.Asset.list(),
  ]).then(([exp, inc, bank, inv, ast]) => {
    setExpenses(exp);
    setIncome(inc);
    setBankAccounts(bank);
    setInvestments(inv);
    setAssets(ast);
    setLoading(false);
  });

  useEffect(() => { loadData(); }, []);

  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";

  const totalIncome = income.reduce((s, i) => s + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpenses;
  const totalBankBalance = bankAccounts.reduce((s, b) => s + (b.balance || 0), 0);
  const totalInvestments = investments.reduce((s, i) => s + (i.balance || 0), 0);
  const totalAssets = assets.reduce((s, a) => s + (a.current_value || 0), 0);
  const netWorth = totalBankBalance + totalInvestments + totalAssets;

  const stats = [
    { label: "Net Worth", value: fmt(netWorth), icon: TrendingUp, color: "text-[#C9A84C]", bg: "bg-[#C9A84C]/10" },
    { label: "Bank Balance", value: fmt(totalBankBalance), icon: Building2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Investments", value: fmt(totalInvestments), icon: BarChart3, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Total Income", value: fmt(totalIncome), icon: Wallet, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Total Expenses", value: fmt(totalExpenses), icon: CreditCard, color: "text-red-400", bg: "bg-red-400/10" },
    {
      label: "Net Cash Flow",
      value: fmt(Math.abs(netCashFlow)),
      icon: netCashFlow >= 0 ? TrendingUp : TrendingDown,
      color: netCashFlow >= 0 ? "text-green-400" : "text-red-400",
      bg: netCashFlow >= 0 ? "bg-green-400/10" : "bg-red-400/10",
      prefix: netCashFlow >= 0 ? "+" : "-",
    },
  ];

  const recentExpenses = expenses.slice(0, 5);
  const recentIncome = income.slice(0, 5);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Dashboard</h1>
        <p className={`${textMuted} mt-1 text-sm`}>Your financial overview</p>
      </div>

      {loading ? (
        <div className={`text-center py-20 ${textMuted}`}>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`rounded-2xl p-5 border ${card}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                    <Icon size={18} className={s.color} />
                  </div>
                  <p className={`text-xs uppercase tracking-wide ${textMuted}`}>{s.label}</p>
                  <p className={`text-xl lg:text-2xl font-bold mt-1 ${s.color}`}>
                    {s.prefix || ""}{s.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className={`rounded-2xl p-5 border ${card}`}>
              <h2 className={`text-base font-semibold mb-4 ${textPrimary}`}>Recent Expenses</h2>
              {recentExpenses.length === 0 ? (
                <p className={`text-sm ${textMuted}`}>No expenses recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((e) => (
                    <div key={e.id} className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{e.title}</p>
                        <p className={`text-xs ${textMuted}`}>{e.date} · {e.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-red-400">-{fmt(e.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`rounded-2xl p-5 border ${card}`}>
              <h2 className={`text-base font-semibold mb-4 ${textPrimary}`}>Recent Income</h2>
              {recentIncome.length === 0 ? (
                <p className={`text-sm ${textMuted}`}>No income recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentIncome.map((i) => (
                    <div key={i.id} className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{i.source}</p>
                        <p className={`text-xs ${textMuted}`}>{i.date} · {i.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-400">+{fmt(i.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
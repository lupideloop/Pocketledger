import { TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, Activity } from "lucide-react";

export default function HealthSummary({ expenses, income, bankAccounts, investments, assets, fmt, dark }) {
  const totalIncome = income.reduce((s, i) => s + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netCashFlow / totalIncome) * 100).toFixed(0) : 0;
  const totalBank = bankAccounts.reduce((s, b) => s + (b.balance || 0), 0);
  const totalInvest = investments.reduce((s, i) => s + (i.balance || 0), 0);
  const totalAssets = assets.reduce((s, a) => s + (a.current_value || 0), 0);
  const netWorth = totalBank + totalInvest + totalAssets;

  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";

  const stats = [
    {
      label: "Total Income",
      value: fmt(totalIncome),
      icon: Wallet,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Total Expenses",
      value: fmt(totalExpenses),
      icon: CreditCard,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    {
      label: "Net Cash Flow",
      value: (netCashFlow >= 0 ? "+" : "") + fmt(netCashFlow),
      icon: netCashFlow >= 0 ? TrendingUp : TrendingDown,
      color: netCashFlow >= 0 ? "text-green-400" : "text-red-400",
      bg: netCashFlow >= 0 ? "bg-green-400/10" : "bg-red-400/10",
    },
    {
      label: "Savings Rate",
      value: `${savingsRate}%`,
      icon: PiggyBank,
      color: parseInt(savingsRate) >= 20 ? "text-[#C9A84C]" : "text-orange-400",
      bg: parseInt(savingsRate) >= 20 ? "bg-[#C9A84C]/10" : "bg-orange-400/10",
    },
    {
      label: "Net Worth",
      value: fmt(netWorth),
      icon: Activity,
      color: "text-[#C9A84C]",
      bg: "bg-[#C9A84C]/10",
    },
    {
      label: "Invest. Portfolio",
      value: fmt(totalInvest),
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className={`rounded-2xl p-4 border ${card}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.bg}`}>
              <Icon size={15} className={s.color} />
            </div>
            <p className={`text-xs ${textMuted} leading-tight`}>{s.label}</p>
            <p className={`text-base font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        );
      })}
    </div>
  );
}
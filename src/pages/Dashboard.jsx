import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Wallet, CreditCard, TrendingUp, Building2, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import StatCard from "@/components/finance/StatCard";
import { useTheme } from "@/components/finance/ThemeContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

const CATEGORY_COLORS = {
  housing: "#3B82F6", food: "#10B981", transport: "#F59E0B", utilities: "#8B5CF6",
  healthcare: "#EF4444", entertainment: "#EC4899", shopping: "#06B6D4",
  education: "#84CC16", insurance: "#6366F1", savings: "#14B8A6", debt: "#F97316", other: "#94A3B8"
};

const fmt = (n) => "$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function Dashboard() {
  const { dark } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Expense.list("-date", 200),
      base44.entities.Income.list("-date", 200),
      base44.entities.BankAccount.list(),
      base44.entities.InvestmentAccount.list(),
      base44.entities.Asset.list(),
    ]).then(([exp, inc, bank, inv, ast]) => {
      setExpenses(exp); setIncome(inc); setBankAccounts(bank); setInvestments(inv); setAssets(ast);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const thisMonthExpenses = expenses
    .filter(e => { try { return isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }); } catch { return false; } })
    .reduce((s, e) => s + (e.amount || 0), 0);

  const thisMonthIncome = income
    .filter(i => { try { return isWithinInterval(parseISO(i.date), { start: monthStart, end: monthEnd }); } catch { return false; } })
    .reduce((s, i) => s + (i.amount || 0), 0);

  const totalBankBalance = bankAccounts.reduce((s, a) => s + (a.balance || 0), 0);
  const totalInvestments = investments.reduce((s, a) => s + (a.balance || 0), 0);
  const totalAssets = assets.reduce((s, a) => s + (a.current_value || 0), 0);
  const netWorth = totalBankBalance + totalInvestments + totalAssets;

  const categoryData = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + (e.amount || 0); return acc; }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: format(d, "MMM"), start: startOfMonth(d), end: endOfMonth(d) };
  });

  const barData = monthLabels.map(({ label, start, end }) => ({
    month: label,
    income: income.filter(i => { try { return isWithinInterval(parseISO(i.date), { start, end }); } catch { return false; } }).reduce((s, i) => s + i.amount, 0),
    expenses: expenses.filter(e => { try { return isWithinInterval(parseISO(e.date), { start, end }); } catch { return false; } }).reduce((s, e) => s + e.amount, 0),
  }));

  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const recentIncome = [...income].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";
  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";
  const chartBg = dark ? "#1E1E30" : "#FFFFFF";
  const chartStroke = dark ? "#2A2A45" : "#F0EEE9";
  const chartTickColor = dark ? "#666688" : "#8A8A99";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Financial Overview</h1>
        <p className={`${textMuted} mt-1`}>{format(now, "MMMM yyyy")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <StatCard label="Net Worth" value={fmt(netWorth)} icon={BarChart3} color="gold" />
        <StatCard label="Monthly Income" value={fmt(thisMonthIncome)} icon={Wallet} color="green" />
        <StatCard label="Expenses" value={fmt(thisMonthExpenses)} icon={CreditCard} color="red" />
        <StatCard label="Bank Balance" value={fmt(totalBankBalance)} icon={Building2} color="blue" />
        <StatCard label="Investments" value={fmt(totalInvestments)} icon={TrendingUp} color="purple" />
      </div>

      {/* Cash flow banner */}
      <div className="bg-[#1A1A2E] rounded-2xl p-5 text-white">
        <p className="text-white/50 text-sm mb-2">This Month's Cash Flow</p>
        <div className="flex flex-wrap items-end gap-3">
          <p className={`text-3xl lg:text-4xl font-bold ${thisMonthIncome - thisMonthExpenses >= 0 ? "text-[#C9A84C]" : "text-red-400"}`}>
            {thisMonthIncome - thisMonthExpenses >= 0 ? "+" : ""}{fmt(thisMonthIncome - thisMonthExpenses)}
          </p>
          <p className="text-white/40 text-sm mb-1">income minus expenses</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className={`rounded-2xl p-5 border ${card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>Income vs Expenses (6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={chartStroke} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartTickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartTickColor }} axisLine={false} tickLine={false} tickFormatter={v => "$" + (v / 1000).toFixed(0) + "k"} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", background: chartBg, fontSize: 12 }} />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-2xl p-5 border ${card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>Expenses by Category</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-2">
              <ResponsiveContainer width="45%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={CATEGORY_COLORS[entry.name] || "#94A3B8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", background: chartBg, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-44">
                {pieData.map(({ name, value }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[name] || "#94A3B8" }} />
                      <span className={`capitalize ${textMuted}`}>{name}</span>
                    </div>
                    <span className={`font-medium ${textPrimary}`}>{fmt(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`flex items-center justify-center h-44 text-sm ${textMuted}`}>No expense data yet</div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className={`rounded-2xl p-5 border ${card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>Recent Expenses</h3>
          {recentExpenses.length === 0 ? (
            <p className={`text-sm ${textMuted}`}>No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map(e => (
                <div key={e.id} className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${textPrimary}`}>{e.title}</p>
                    <p className={`text-xs capitalize ${textMuted}`}>{e.category} · {e.date}</p>
                  </div>
                  <div className="flex items-center gap-1 text-red-500 font-semibold text-sm">
                    <ArrowDownRight size={14} />{fmt(e.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`rounded-2xl p-5 border ${card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>Recent Income</h3>
          {recentIncome.length === 0 ? (
            <p className={`text-sm ${textMuted}`}>No income recorded yet</p>
          ) : (
            <div className="space-y-3">
              {recentIncome.map(i => (
                <div key={i.id} className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${textPrimary}`}>{i.source}</p>
                    <p className={`text-xs capitalize ${textMuted}`}>{i.category} · {i.date}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-500 font-semibold text-sm">
                    <ArrowUpRight size={14} />{fmt(i.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
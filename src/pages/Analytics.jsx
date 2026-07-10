import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/components/finance/ThemeContext";
import SpendingBreakdown from "@/components/analytics/SpendingBreakdown";
import IncomeTrend from "@/components/analytics/IncomeTrend";
import NetWorthTrend from "@/components/analytics/NetWorthTrend";
import HealthSummary from "@/components/analytics/HealthSummary";
import DateRangePicker from "@/components/analytics/DateRangePicker";

export default function Analytics() {
  const { dark, fmt } = useTheme();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [assets, setAssets] = useState([]);

  // Default: last 6 months
  const defaultStart = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    return d.toISOString().slice(0, 7) + "-01";
  };
  const defaultEnd = () => new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  useEffect(() => {
    Promise.all([
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
  }, []);

  const filteredExpenses = useMemo(() =>
    expenses.filter(e => e.date >= startDate && e.date <= endDate),
    [expenses, startDate, endDate]
  );

  const filteredIncome = useMemo(() =>
    income.filter(i => i.date >= startDate && i.date <= endDate),
    [income, startDate, endDate]
  );

  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>Analytics</h1>
          <p className={`${textMuted} mt-1 text-sm`}>Insights into your financial health</p>
        </div>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      </div>

      {loading ? (
        <div className={`text-center py-20 ${textMuted}`}>Loading...</div>
      ) : (
        <>
          {/* Health summary cards */}
          <HealthSummary
            expenses={filteredExpenses}
            income={filteredIncome}
            bankAccounts={bankAccounts}
            investments={investments}
            assets={assets}
            fmt={fmt}
            dark={dark}
          />

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SpendingBreakdown expenses={filteredExpenses} fmt={fmt} dark={dark} />
            <IncomeTrend income={filteredIncome} expenses={filteredExpenses} startDate={startDate} endDate={endDate} fmt={fmt} dark={dark} />
          </div>

          {/* Net worth trend */}
          <NetWorthTrend
            bankAccounts={bankAccounts}
            investments={investments}
            assets={assets}
            income={income}
            expenses={expenses}
            startDate={startDate}
            endDate={endDate}
            fmt={fmt}
            dark={dark}
          />
        </>
      )}
    </div>
  );
}
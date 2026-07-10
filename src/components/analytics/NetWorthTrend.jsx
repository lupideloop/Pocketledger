import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

function getMonthsBetween(start, end) {
  const months = [];
  const s = new Date(start);
  const e = new Date(end);
  s.setDate(1);
  while (s <= e) {
    months.push(s.toISOString().slice(0, 7));
    s.setMonth(s.getMonth() + 1);
  }
  return months;
}

export default function NetWorthTrend({ bankAccounts, investments, assets, liabilities, income, expenses, startDate, endDate, fmt, dark }) {
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";
  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";

  // Current static net worth base
  const baseNetWorth = useMemo(() => {
    return (
      bankAccounts.reduce((s, b) => s + (b.balance || 0), 0) +
      investments.reduce((s, i) => s + (i.balance || 0), 0) +
      assets.reduce((s, a) => s + (a.current_value || 0), 0) -
      (liabilities || []).reduce((s, l) => s + (l.current_balance || 0), 0)
    );
  }, [bankAccounts, investments, assets, liabilities]);

  // Reconstruct net worth over time by walking backwards from current value
  const data = useMemo(() => {
    const months = getMonthsBetween(startDate, endDate);
    // Group net cash flow per month
    const cashByMonth = {};
    [...income, ...expenses].forEach(tx => {
      const m = tx.date?.slice(0, 7);
      if (!m) return;
      const sign = income.includes(tx) ? 1 : -1;
      cashByMonth[m] = (cashByMonth[m] || 0) + sign * (tx.amount || 0);
    });

    // Build cumulative from current backwards
    const allMonths = [...months].reverse();
    let runningNW = baseNetWorth;
    const reversed = allMonths.map(month => {
      const flow = cashByMonth[month] || 0;
      const nw = Math.round(runningNW);
      runningNW -= flow; // subtract going back in time
      return { month, netWorth: nw };
    });
    return reversed.reverse().map(d => ({
      month: d.month.slice(5) + "/" + d.month.slice(2, 4),
      "Net Worth": d.netWorth,
    }));
  }, [baseNetWorth, income, expenses, startDate, endDate]);

  const tooltipStyle = {
    background: dark ? "#1E1E30" : "#fff",
    border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E8E6E1",
    borderRadius: 12,
    color: dark ? "#fff" : "#1A1A2E",
    fontSize: 12,
  };

  const allValues = data.map(d => d["Net Worth"]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const change = data.length > 1 ? data[data.length - 1]["Net Worth"] - data[0]["Net Worth"] : 0;

  return (
    <div className={`rounded-2xl p-5 border ${card}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-base font-semibold ${textPrimary}`}>Estimated Net Worth Trend</h2>
          {data.length > 1 && (
            <p className={`text-xs mt-0.5 ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {change >= 0 ? "+" : ""}{fmt(change)} estimated change
            </p>
          )}
        </div>
        <div className="text-right">
          <p className={`text-xs ${textMuted}`}>Current</p>
          <p className="text-lg font-bold text-[#C9A84C]">{fmt(baseNetWorth)}</p>
        </div>
      </div>
      <p className={`text-xs mb-4 ${textMuted}`}>
        Estimate based on today&apos;s account, investment, asset, and liability values, adjusted by recorded income and expenses. It is not a historical valuation.
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.05)" : "#F0EDE8"} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: dark ? "rgba(255,255,255,0.3)" : "#8A8A99" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis width={38} tick={{ fontSize: 10, fill: dark ? "rgba(255,255,255,0.3)" : "#8A8A99" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val) => fmt(val)} />
          {minVal < 0 && <ReferenceLine y={0} stroke={dark ? "rgba(255,255,255,0.15)" : "#ccc"} />}
          <Line
            type="monotone"
            dataKey="Net Worth"
            stroke="#C9A84C"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#C9A84C", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
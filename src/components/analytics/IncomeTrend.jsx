import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

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

export default function IncomeTrend({ income, expenses, startDate, endDate, fmt, dark }) {
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";
  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";

  const data = useMemo(() => {
    const months = getMonthsBetween(startDate, endDate);
    return months.map(month => {
      const inc = income.filter(i => i.date?.slice(0, 7) === month).reduce((s, i) => s + (i.amount || 0), 0);
      const exp = expenses.filter(e => e.date?.slice(0, 7) === month).reduce((s, e) => s + (e.amount || 0), 0);
      return {
        month: month.slice(5) + "/" + month.slice(2, 4),
        Income: Math.round(inc),
        Expenses: Math.round(exp),
      };
    });
  }, [income, expenses, startDate, endDate]);

  const tooltipStyle = {
    background: dark ? "#1E1E30" : "#fff",
    border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E8E6E1",
    borderRadius: 12,
    color: dark ? "#fff" : "#1A1A2E",
    fontSize: 12,
  };

  return (
    <div className={`rounded-2xl p-5 border ${card}`}>
      <h2 className={`text-base font-semibold mb-4 ${textPrimary}`}>Income vs Expenses</h2>
      {data.every(d => d.Income === 0 && d.Expenses === 0) ? (
        <p className={`text-sm text-center py-10 ${textMuted}`}>No data in this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.05)" : "#F0EDE8"} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: dark ? "rgba(255,255,255,0.3)" : "#8A8A99" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: dark ? "rgba(255,255,255,0.3)" : "#8A8A99" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(val) => fmt(val)} />
            <Legend wrapperStyle={{ fontSize: 12, color: dark ? "rgba(255,255,255,0.5)" : "#8A8A99" }} />
            <Bar dataKey="Income" fill="#4CC96A" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Expenses" fill="#C94C4C" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
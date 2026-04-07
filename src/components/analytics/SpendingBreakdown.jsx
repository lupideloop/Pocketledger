import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CAT_LABELS = {
  housing: "Housing", food: "Food", transport: "Transport", utilities: "Utilities",
  healthcare: "Healthcare", entertainment: "Entertainment", shopping: "Shopping",
  education: "Education", insurance: "Insurance", savings: "Savings", debt: "Debt", other: "Other",
};

const COLORS = [
  "#C9A84C", "#4C9AC9", "#4CC96A", "#C94C4C", "#9A4CC9",
  "#C97A4C", "#4CC9C9", "#C9C94C", "#7AC94C", "#C94C9A", "#4C6AC9", "#999",
];

export default function SpendingBreakdown({ expenses, fmt, dark }) {
  const card = dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]";
  const textPrimary = dark ? "text-white" : "text-[#1A1A2E]";
  const textMuted = dark ? "text-white/40" : "text-[#8A8A99]";

  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category || "other";
    acc[cat] = (acc[cat] || 0) + (e.amount || 0);
    return acc;
  }, {});

  const data = Object.entries(byCategory)
    .map(([cat, value]) => ({ name: CAT_LABELS[cat] || cat, value }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className={`rounded-2xl p-5 border ${card}`}>
      <h2 className={`text-base font-semibold mb-4 ${textPrimary}`}>Spending by Category</h2>
      {data.length === 0 ? (
        <p className={`text-sm text-center py-10 ${textMuted}`}>No expenses in this period.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => fmt(val)}
                contentStyle={{
                  background: dark ? "#1E1E30" : "#fff",
                  border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E8E6E1",
                  borderRadius: 12,
                  color: dark ? "#fff" : "#1A1A2E",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {data.slice(0, 6).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className={`text-xs ${textMuted}`}>{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${textPrimary}`}>{fmt(d.value)}</span>
                  <span className={`text-xs ${textMuted}`}>{total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
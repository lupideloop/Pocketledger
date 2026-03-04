import { useTheme } from "@/components/finance/ThemeContext";

export default function StatCard({ label, value, sub, icon: Icon, color = "gold", trend }) {
  const { dark } = useTheme();
  const colors = {
    gold: "from-[#C9A84C] to-[#F0D58C]",
    blue: "from-[#3B82F6] to-[#93C5FD]",
    green: "from-[#10B981] to-[#6EE7B7]",
    red: "from-[#EF4444] to-[#FCA5A5]",
    purple: "from-[#8B5CF6] to-[#C4B5FD]",
  };

  return (
    <div className={`rounded-2xl p-5 border transition-shadow duration-300 hover:shadow-lg ${dark ? "bg-[#1E1E30] border-white/10" : "bg-white border-[#E8E6E1]"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${dark ? "text-white/40" : "text-[#8A8A99]"}`}>{label}</p>
      <p className={`text-xl font-bold ${dark ? "text-white" : "text-[#1A1A2E]"}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${dark ? "text-white/40" : "text-[#8A8A99]"}`}>{sub}</p>}
    </div>
  );
}
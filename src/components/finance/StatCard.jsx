export default function StatCard({ label, value, sub, icon: Icon, color = "gold", trend }) {
  const colors = {
    gold: "from-[#C9A84C] to-[#F0D58C]",
    blue: "from-[#3B82F6] to-[#93C5FD]",
    green: "from-[#10B981] to-[#6EE7B7]",
    red: "from-[#EF4444] to-[#FCA5A5]",
    purple: "from-[#8B5CF6] to-[#C4B5FD]",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E8E6E1] hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p className="text-[#8A8A99] text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
      {sub && <p className="text-[#8A8A99] text-xs mt-1">{sub}</p>}
    </div>
  );
}
import { Search } from "lucide-react";
import { useTheme } from "@/components/finance/ThemeContext";

export default function TransactionFilters({ search, onSearch, category, onCategory, categories, labels, count }) {
  const { dark } = useTheme();
  const field = dark
    ? "bg-[#1E1E30] border-white/10 text-white placeholder-white/30"
    : "bg-white border-[#E8E6E1] text-[#1A1A2E] placeholder-[#8A8A99]";
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <label className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A99]" />
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search transactions…" className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 ${field}`} />
      </label>
      <select value={category} onChange={e => onCategory(e.target.value)} className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 ${field}`}>
        <option value="">All categories</option>
        {categories.map(item => <option key={item} value={item}>{labels[item] || item}</option>)}
      </select>
      <span className="text-xs text-[#8A8A99] whitespace-nowrap">{count} results</span>
    </div>
  );
}
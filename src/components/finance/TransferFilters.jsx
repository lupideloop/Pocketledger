import { Search } from "lucide-react";
import { Select } from "@/components/finance/FieldGroup";
import { useTheme } from "@/components/finance/ThemeContext";

export default function TransferFilters({ search, onSearch, account, onAccount, accounts, count }) {
  const { dark } = useTheme();
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="relative flex-1">
        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-white/30" : "text-[#8A8A99]"}`} />
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search accounts, date, or notes" className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 ${dark ? "bg-[#1E1E30] border-white/10 text-white" : "bg-white border-[#E8E6E1] text-[#1A1A2E]"}`} />
      </div>
      <Select value={account} onChange={e => onAccount(e.target.value)} className="sm:w-56">
        <option value="">All accounts</option>
        {accounts.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </Select>
      <span className={`text-xs whitespace-nowrap ${dark ? "text-white/40" : "text-[#8A8A99]"}`}>{count} results</span>
    </div>
  );
}
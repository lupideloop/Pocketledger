import { ArrowRight, ArrowLeftRight, Trash2 } from "lucide-react";
import LoadingSkeleton from "@/components/finance/LoadingSkeleton";
import { useTheme } from "@/components/finance/ThemeContext";

export default function TransferList({ items, loading, hasTransfers, onDelete }) {
  const { dark, fmt } = useTheme();
  const primary = dark ? "text-white" : "text-[#1A1A2E]", muted = dark ? "text-white/40" : "text-[#8A8A99]";
  return (
    <div className={`rounded-2xl border divide-y ${dark ? "bg-[#1E1E30] border-white/10 divide-white/5" : "bg-white border-[#E8E6E1] divide-[#F0EDE8]"}`}>
      {loading && <div className="p-4"><LoadingSkeleton variant="list" count={4} /></div>}
      {!loading && !hasTransfers && <div className="text-center py-16"><ArrowLeftRight size={40} className={`mx-auto mb-3 ${dark ? "text-white/10" : "text-[#E8E6E1]"}`} /><p className={muted}>No transfers yet.</p></div>}
      {!loading && hasTransfers && items.length === 0 && <div className={`text-center py-12 text-sm ${muted}`}>No transfers match your search.</div>}
      {items.map(item => (
        <div key={item.id} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 group">
          <div className="min-w-0"><div className={`flex items-center gap-2 font-medium text-sm ${primary}`}><span className="truncate">{item.source_account_name}</span><ArrowRight size={14} className="text-[#C9A84C] shrink-0" /><span className="truncate">{item.destination_account_name}</span></div><p className={`text-xs mt-1 ${muted}`}>{item.date}{item.notes ? ` · ${item.notes}` : ""}</p></div>
          <div className="flex items-center gap-2 shrink-0"><span className={`font-bold ${primary}`}>{fmt(item.amount)}</span><button onClick={() => onDelete(item)} aria-label={`Delete transfer from ${item.source_account_name} to ${item.destination_account_name}`} className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-red-400" /></button></div>
        </div>
      ))}
    </div>
  );
}
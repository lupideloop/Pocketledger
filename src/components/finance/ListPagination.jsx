import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/finance/ThemeContext";

export default function ListPagination({ page, pageCount, onPage }) {
  const { dark } = useTheme();
  if (pageCount <= 1) return null;
  const button = `p-2 rounded-lg border disabled:opacity-30 ${dark ? "border-white/10 text-white" : "border-[#E8E6E1] text-[#1A1A2E]"}`;
  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Transaction pages">
      <button className={button} onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
      <span className={`text-sm ${dark ? "text-white/60" : "text-[#8A8A99]"}`}>Page {page} of {pageCount}</span>
      <button className={button} onClick={() => onPage(page + 1)} disabled={page === pageCount} aria-label="Next page"><ChevronRight size={16} /></button>
    </nav>
  );
}
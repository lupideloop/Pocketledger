import { useTheme } from "@/components/finance/ThemeContext";

export function Field({ label, children }) {
  const { dark } = useTheme();
  return (
    <div className="space-y-1.5">
      <label className={`text-xs font-medium uppercase tracking-wider ${dark ? "text-white/40" : "text-[#8A8A99]"}`}>{label}</label>
      {children}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  const { dark } = useTheme();
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all ${dark ? "bg-[#0F0F1A] border-white/10 text-white placeholder-white/20" : "bg-[#F8F7F4] border-[#E8E6E1] text-[#1A1A2E]"} ${className}`}
    />
  );
}

export function Select({ children, className = "", ...props }) {
  const { dark } = useTheme();
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all ${dark ? "bg-[#0F0F1A] border-white/10 text-white" : "bg-[#F8F7F4] border-[#E8E6E1] text-[#1A1A2E]"} ${className}`}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }) {
  const { dark } = useTheme();
  return (
    <textarea
      {...props}
      rows={3}
      className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all resize-none ${dark ? "bg-[#0F0F1A] border-white/10 text-white placeholder-white/20" : "bg-[#F8F7F4] border-[#E8E6E1] text-[#1A1A2E]"} ${className}`}
    />
  );
}
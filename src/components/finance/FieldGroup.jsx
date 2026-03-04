export function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#8A8A99] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl border border-[#E8E6E1] bg-[#F8F7F4] text-[#1A1A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all ${className}`}
    />
  );
}

export function Select({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl border border-[#E8E6E1] bg-[#F8F7F4] text-[#1A1A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all ${className}`}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`w-full px-3 py-2.5 rounded-xl border border-[#E8E6E1] bg-[#F8F7F4] text-[#1A1A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all resize-none ${className}`}
    />
  );
}
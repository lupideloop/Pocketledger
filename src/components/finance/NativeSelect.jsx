import { ChevronDown } from "lucide-react";
import { useTheme } from "@/components/finance/ThemeContext";

/**
 * Mobile-friendly select wrapper.
 * Renders a native <select> with a custom styled container & chevron.
 * The native <select> ensures the OS picker sheet opens on iOS/Android.
 */
export default function NativeSelect({ value, onChange, options, placeholder, className = "" }) {
  const { dark } = useTheme();

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className={`
          w-full appearance-none px-3 py-2.5 pr-9 rounded-xl border text-sm
          focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]
          transition-all cursor-pointer
          ${dark
            ? "bg-[#0F0F1A] border-white/10 text-white"
            : "bg-[#F8F7F4] border-[#E8E6E1] text-[#1A1A2E]"
          }
        `}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dark ? "text-white/30" : "text-[#8A8A99]"}`}
      />
    </div>
  );
}
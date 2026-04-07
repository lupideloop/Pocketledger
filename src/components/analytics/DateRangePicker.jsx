import { useTheme } from "@/components/finance/ThemeContext";

const PRESETS = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
];

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }) {
  const { dark } = useTheme();
  const inputCls = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all ${dark ? "bg-[#0F0F1A] border-white/10 text-white" : "bg-[#F8F7F4] border-[#E8E6E1] text-[#1A1A2E]"}`;
  const btnBase = `px-3 py-1.5 rounded-lg text-xs font-medium transition-all border`;
  const btnActive = `bg-[#C9A84C] text-[#1A1A2E] border-[#C9A84C]`;
  const btnInactive = dark ? `border-white/10 text-white/50 hover:bg-white/5` : `border-[#E8E6E1] text-[#8A8A99] hover:bg-[#F8F7F4]`;

  const applyPreset = (months) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    onStartChange(start.toISOString().slice(0, 7) + "-01");
    onEndChange(end.toISOString().slice(0, 10));
  };

  const activePreset = PRESETS.find(p => {
    const start = new Date();
    start.setMonth(start.getMonth() - (p.months - 1));
    return startDate === start.toISOString().slice(0, 7) + "-01";
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.months)}
            className={`${btnBase} ${activePreset?.label === p.label ? btnActive : btnInactive}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input type="date" value={startDate} onChange={e => onStartChange(e.target.value)} className={`${inputCls} w-36`} />
        <span className={`text-xs ${dark ? "text-white/30" : "text-[#C0BDB8]"}`}>→</span>
        <input type="date" value={endDate} onChange={e => onEndChange(e.target.value)} className={`${inputCls} w-36`} />
      </div>
    </div>
  );
}
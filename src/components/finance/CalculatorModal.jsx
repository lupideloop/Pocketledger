import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useTheme } from "@/components/finance/ThemeContext";
import useAccessibleDialog from "@/hooks/useAccessibleDialog";
import useCalculator from "@/hooks/useCalculator";

const keys = ["C", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ".", "⌫", "="];
const labels = { "±": "Change sign", "%": "Percent", "÷": "Divide", "×": "Multiply", "−": "Subtract", "+": "Add", "⌫": "Backspace", "=": "Equals", ".": "Decimal point", C: "Clear" };

export default function CalculatorModal({ open, onClose }) {
  const { dark } = useTheme();
  const { display, press, clear } = useCalculator();
  const { dialogRef, titleId, close } = useAccessibleDialog(() => { clear(); onClose(); }, open);

  useEffect(() => {
    if (!open) return undefined;
    const keyMap = { Enter: "=", "=": "=", Backspace: "⌫", Delete: "C", c: "C", C: "C", "-": "−", "*": "×", "/": "÷" };
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = /^\d$/.test(event.key) || [".", "+", "%"].includes(event.key) ? event.key : keyMap[event.key];
      if (!key) return;
      event.preventDefault();
      press(key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, press]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={`relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl ${dark ? "bg-[#1E1E30]" : "bg-white"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className={`font-semibold ${dark ? "text-white" : "text-[#1A1A2E]"}`}>Calculator</h2>
          <button type="button" onClick={close} aria-label="Close calculator" className={`h-11 w-11 flex items-center justify-center rounded-xl ${dark ? "text-white/60 hover:bg-white/10" : "text-[#8A8A99] hover:bg-[#F8F7F4]"}`}><X size={19} /></button>
        </div>
        <output aria-live="polite" className={`mb-4 block min-h-20 overflow-hidden rounded-xl px-4 py-5 text-right text-3xl font-semibold ${dark ? "bg-[#0F0F1A] text-white" : "bg-[#F8F7F4] text-[#1A1A2E]"}`}>{display}</output>
        <div className="grid grid-cols-4 gap-2">
          {keys.map(key => <button type="button" key={key} onClick={() => press(key)} aria-label={labels[key] || key} className={`h-12 rounded-xl text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] ${key === "=" ? "bg-[#C9A84C] text-[#1A1A2E] hover:bg-[#D7B85E]" : ["÷", "×", "−", "+"].includes(key) ? dark ? "bg-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C]/30" : "bg-[#C9A84C]/15 text-[#8A6B19] hover:bg-[#C9A84C]/25" : dark ? "bg-white/5 text-white hover:bg-white/10" : "bg-[#F8F7F4] text-[#1A1A2E] hover:bg-[#EEECE7]"}`}>{key}</button>)}
        </div>
      </section>
    </div>, document.body
  );
}
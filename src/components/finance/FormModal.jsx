import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/finance/ThemeContext";

export default function FormModal({ title, onClose, children, onSubmit, submitting }) {
  const { dark } = useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto ${dark ? "bg-[#1E1E30]" : "bg-white"}`}>
        <div className={`flex items-center justify-between p-5 border-b ${dark ? "border-white/10" : "border-[#E8E6E1]"}`}>
          <h2 className={`text-lg font-semibold ${dark ? "text-white" : "text-[#1A1A2E]"}`}>{title}</h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-white/10 text-white/50" : "hover:bg-[#F8F7F4] text-[#8A8A99]"}`}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {children}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className={`flex-1 ${dark ? "border-white/20 text-white hover:bg-white/10" : ""}`}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#C9A84C] hover:bg-[#b8963f] text-[#1A1A2E] font-semibold"
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
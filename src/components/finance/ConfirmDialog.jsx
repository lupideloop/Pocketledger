import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/finance/ThemeContext";

export default function ConfirmDialog({ title = "Delete item?", message, onConfirm, onCancel }) {
  const { dark } = useTheme();

  const modal = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className={`relative rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 space-y-4 ${dark ? "bg-[#1E1E30]" : "bg-white"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h2 className={`font-bold text-base ${dark ? "text-white" : "text-[#1A1A2E]"}`}>{title}</h2>
        </div>
        {message && <p className={`text-sm ${dark ? "text-white/50" : "text-[#8A8A99]"}`}>{message}</p>}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onCancel} className={`flex-1 ${dark ? "border-white/20 text-white hover:bg-white/10" : ""}`}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FormModal({ title, onClose, children, onSubmit, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E8E6E1]">
          <h2 className="text-lg font-semibold text-[#1A1A2E]">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <X size={16} className="text-[#8A8A99]" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#1A1A2E] hover:bg-[#16213E] text-white"
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/finance/ThemeContext";

export default function TransferHeader({ count, onCreate }) {
  const { dark } = useTheme();
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className={`text-2xl lg:text-3xl font-bold ${dark ? "text-white" : "text-[#1A1A2E]"}`}>Transfers</h1>
        <p className={`mt-1 text-sm ${dark ? "text-white/40" : "text-[#8A8A99]"}`}>{count} transfers between your accounts</p>
      </div>
      <Button onClick={onCreate} disabled={count === undefined} className="bg-[#C9A84C] hover:bg-[#b8963f] text-[#1A1A2E] font-semibold rounded-xl gap-2">
        <Plus size={16} /> New Transfer
      </Button>
    </div>
  );
}
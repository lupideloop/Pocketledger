import { useState } from "react";
import { Download } from "lucide-react";
import { useTheme } from "@/components/finance/ThemeContext";
import { downloadFinancialBackup } from "@/components/finance/csvBackup";

export default function ExportBackupButton() {
  const { dark } = useTheme();
  const [status, setStatus] = useState("");
  const handleExport = async () => {
    setStatus("Preparing backup…");
    try {
      const count = await downloadFinancialBackup();
      setStatus(`${count} records downloaded`);
    } catch (error) {
      setStatus(error.message || "Backup could not be created.");
    }
  };
  return (
    <div className="px-4 py-4">
      <button onClick={handleExport} disabled={status === "Preparing backup…"} className={`w-full flex items-center justify-between text-left disabled:opacity-50 ${dark ? "text-white" : "text-[#1A1A2E]"}`}>
        <span className="flex items-center gap-3 text-sm font-medium"><Download size={18} className="text-[#C9A84C]" />Download CSV Backup</span>
        <span className="text-xs text-[#8A8A99]">{status || "All financial data"}</span>
      </button>
    </div>
  );
}
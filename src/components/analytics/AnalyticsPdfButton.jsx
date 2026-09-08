import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function AnalyticsPdfButton({ targetId, disabled, dark }) {
  const [exporting, setExporting] = useState(false);

  const exportPdf = async () => {
    const target = document.getElementById(targetId);
    if (!target) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: dark ? "#0F0F1A" : "#F8F7F4",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = canvas.height * pageWidth / canvas.width;
      const image = canvas.toDataURL("image/png");
      let remaining = imageHeight;
      let position = 0;
      pdf.addImage(image, "PNG", 0, position, pageWidth, imageHeight);
      remaining -= pageHeight;
      while (remaining > 0) {
        position = remaining - imageHeight;
        pdf.addPage();
        pdf.addImage(image, "PNG", 0, position, pageWidth, imageHeight);
        remaining -= pageHeight;
      }
      pdf.save(`analytics-snapshot-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: "Analytics PDF exported" });
    } catch (error) {
      toast({ title: "Could not export PDF", description: error.message, variant: "destructive" });
    } finally { setExporting(false); }
  };

  return <Button type="button" variant="outline" onClick={exportPdf} disabled={disabled || exporting} data-html2canvas-ignore="true" className="h-11 rounded-xl gap-2">{exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {exporting ? "Exporting…" : "Export PDF"}</Button>;
}
import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileSpreadsheet, Building2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportTitle: string;
  branchName?: string;
  dateRangeLabel: string;
  summaryMetrics: { label: string; value: string }[];
  columns: { header: string; key: string; align?: "left" | "right" | "center" }[];
  data: Record<string, any>[];
  taxPin?: string;
}

export function CorporateReportModal({
  open,
  onOpenChange,
  reportTitle,
  branchName = "All Enterprise Branches (Global)",
  dateRangeLabel,
  summaryMetrics,
  columns,
  data,
  taxPin = "P051982736Z",
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!data.length) return toast.info("No data rows to export.");
    const headers = columns.map((c) => c.header);
    const keys = columns.map((c) => c.key);

    const rows = data.map((row) =>
      keys
        .map((k) => {
          const val = row[k] ?? "";
          const str = typeof val === "object" ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV export downloaded successfully.");
  };

  const handleExportExcelXml = () => {
    if (!data.length) return toast.info("No data rows to export.");

    // High-compatibility XML Spreadsheet format readable by all Excel versions
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${reportTitle.slice(0, 30)}">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">TINDI HOLDINGS LIMITED - ${reportTitle.toUpperCase()}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Branch: ${branchName} | Period: ${dateRangeLabel} | Generated: ${new Date().toLocaleString()}</Data></Cell>
   </Row>
   <Row ss:Index="4">
`;
    columns.forEach((c) => {
      xml += `    <Cell><Data ss:Type="String">${c.header}</Data></Cell>\n`;
    });
    xml += `   </Row>\n`;

    data.forEach((row) => {
      xml += `   <Row>\n`;
      columns.forEach((c) => {
        const val = row[c.key] ?? "";
        const isNum = typeof val === "number" || (!isNaN(Number(val)) && val !== "");
        xml += `    <Cell><Data ss:Type="${isNum ? "Number" : "String"}">${val}</Data></Cell>\n`;
      });
      xml += `   </Row>\n`;
    });

    xml += `  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Formatted Excel spreadsheet exported successfully.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-border bg-card">
        {/* Modal Toolbar (hidden during print) */}
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-muted/20 print:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">{reportTitle}</h3>
              <p className="text-[10px] text-muted-foreground">{branchName} • {dateRangeLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCsv}
              variant="outline"
              size="sm"
              className="rounded-xl h-8 text-xs font-bold gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button
              onClick={handleExportExcelXml}
              variant="outline"
              size="sm"
              className="rounded-xl h-8 text-xs font-bold gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel (.xls)
            </Button>
            <Button
              onClick={handlePrint}
              size="sm"
              className="rounded-xl h-8 text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Corporate Report Canvas */}
        <div
          ref={printRef}
          className="p-8 space-y-6 bg-white text-slate-900 font-sans print:p-0 print:m-0"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                TINDI HOLDINGS LIMITED
              </h1>
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                Enterprise Commerce & Distribution Division
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                KRA PIN: <strong className="font-mono">{taxPin}</strong> • eTIMS Compliant Node
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-2.5 py-1 rounded">
                OFFICIAL REPORT
              </span>
              <div className="text-xs font-bold text-slate-800 pt-1">{reportTitle}</div>
              <div className="text-[10px] text-slate-500">
                Period: <strong>{dateRangeLabel}</strong>
              </div>
              <div className="text-[10px] text-slate-500">
                Location: <strong>{branchName}</strong>
              </div>
            </div>
          </div>

          {/* Executive Summary Metrics Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {summaryMetrics.map((m, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">
                  {m.label}
                </span>
                <span className="text-base font-black text-slate-900 block truncate font-mono">
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-black uppercase text-slate-700">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className={`px-3 py-2.5 ${
                        c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"
                      }`}
                    >
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.slice(0, 100).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-3 py-2 ${
                          c.align === "right"
                            ? "text-right font-mono"
                            : c.align === "center"
                            ? "text-center"
                            : "text-left"
                        }`}
                      >
                        {String(row[c.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer & Signatures */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-[10px] text-slate-600">
            <div className="space-y-6">
              <div>
                <span className="font-bold text-slate-900 block">PREPARED BY:</span>
                <span className="text-slate-500">System Controller</span>
              </div>
              <div className="border-b border-slate-400 w-36" />
            </div>

            <div className="space-y-6">
              <div>
                <span className="font-bold text-slate-900 block">BRANCH MANAGER:</span>
                <span className="text-slate-500">{branchName}</span>
              </div>
              <div className="border-b border-slate-400 w-36" />
            </div>

            <div className="space-y-6 text-right">
              <div>
                <span className="font-bold text-slate-900 block">EXECUTIVE APPROVAL:</span>
                <span className="text-slate-500">Finance & Auditing Board</span>
              </div>
              <div className="border-b border-slate-400 w-36 ml-auto" />
            </div>
          </div>

          <div className="text-[9px] text-center text-slate-400 pt-4">
            CONFIDENTIAL — FOR INTERNAL TINDI HOLDINGS LIMITED RECORD KEEPING & COMPLIANCE ONLY • GENERATED: {new Date().toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

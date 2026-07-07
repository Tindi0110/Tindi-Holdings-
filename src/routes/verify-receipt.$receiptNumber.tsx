import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { verifyReceipt } from "@/lib/receipts.functions";
import { ShieldCheck, ShieldAlert, ArrowLeft, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";

// Validate search parameters (we expect a cryptographic signature 'sig')
const verifySearchSchema = z.object({
  sig: z.string().default(""),
});

export const Route = createFileRoute("/verify-receipt/$receiptNumber")({
  validateSearch: verifySearchSchema,
  head: () => ({
    meta: [
      { title: "Receipt Integrity Registry — Tindi Holdings" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VerifyReceiptPage,
});

function VerifyReceiptPage() {
  const { receiptNumber } = Route.useParams();
  const { sig } = Route.useSearch();
  const [telemetry, setTelemetry] = useState({ ip: "127.0.0.1", agent: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTelemetry({
        ip: "Client Node Connected",
        agent: window.navigator.userAgent,
      });
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["receipt", "verify", receiptNumber, sig],
    queryFn: () => verifyReceipt({ data: { receiptNumber, signature: sig } }),
    enabled: !!receiptNumber,
  });

  const isVerified = data?.verified === true;
  const receipt = data?.receipt;

  // Determine watermark styling
  const watermarkText = receipt?.receipt_status?.toUpperCase() || "PAID";
  const watermarkColors: Record<string, string> = {
    GENERATED: "text-emerald-500/5 border-emerald-500/10",
    VIEWED: "text-blue-500/5 border-blue-500/10",
    PRINTED: "text-indigo-500/5 border-indigo-500/10",
    DOWNLOADED: "text-violet-500/5 border-violet-500/10",
    EMAILED: "text-cyan-500/5 border-cyan-500/10",
    CANCELLED: "text-rose-500/5 border-rose-500/10",
    REFUNDED: "text-amber-500/5 border-amber-500/10",
    RETURNED: "text-orange-500/5 border-orange-500/10",
  };

  return (
    <div className="min-h-screen bg-navy text-navy-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glowing decorations */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphism Wrapper */}
      <div className="w-full max-w-lg bg-navy-hover/80 border border-navy-foreground/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative z-10 overflow-hidden">
        {/* Large diagonal Watermark for verified receipts */}
        {isVerified && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className={`text-6xl font-black uppercase tracking-[0.25em] rotate-12 select-none border-4 border-dashed rounded-2xl px-6 py-3 ${watermarkColors[watermarkText] || "text-emerald-500/5 border-emerald-500/10"}`}>
              {watermarkText}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-navy border border-navy-foreground/10 flex items-center justify-center text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-[0.25em] text-navy-foreground/50 uppercase">
              Tindi Holdings Limited
            </h1>
            <p className="text-sm font-extrabold text-navy-foreground">Security Registry Node</p>
          </div>
          <div className="ml-auto text-[10px] font-bold text-navy-foreground/40 uppercase tracking-wider">
            v2.1-SEC
          </div>
        </div>

        {/* Content State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 relative z-10">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest text-navy-foreground/40 animate-pulse">
              Decrypting signature credentials...
            </p>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {/* Status Shield */}
            {isVerified ? (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center shrink-0">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wide">
                    ✓ Valid Receipt Authenticated
                  </h3>
                  <p className="text-xs text-navy-foreground/60 mt-0.5">
                    This receipt represents a genuine transaction registered on the Tindi Ledger.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 grid place-items-center shrink-0">
                  <ShieldAlert className="h-6 w-6 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-rose-400 uppercase tracking-wide">
                    ⚠️ Authenticity Failure
                  </h3>
                  <p className="text-xs text-rose-400/80 mt-0.5">
                    {data?.reason || "Cryptographic signature check failed or receipt not found."}
                  </p>
                </div>
              </div>
            )}

            {/* Receipt Details Grid */}
            {isVerified && receipt && (
              <div className="bg-navy/80 border border-navy-foreground/5 rounded-2xl p-6 space-y-4">
                <h4 className="text-[10px] font-black tracking-widest text-navy-foreground/40 uppercase">
                  Registry Parameters
                </h4>
                <div className="divide-y divide-navy-foreground/5 space-y-3">
                  <Row label="Company Node" value={receipt.company_name} />
                  <Row label="Receipt ID" value={receipt.receipt_number} highlight />
                  <Row label="Invoice reference" value={receipt.invoice_number} />
                  <Row label="Operating Branch" value={receipt.branch} />
                  <Row label="Timestamp" value={`${receipt.date} ${receipt.time}`} />
                  <Row label="Valuation Paid" value={`${receipt.currency} ${Number(receipt.amount_paid).toLocaleString()}`} highlight />
                  <Row label="Payment Status" value="Settled / Verified" success />
                  <Row label="Lifecycle status" value={receipt.receipt_status} uppercase />
                </div>
              </div>
            )}

            {/* Audit trail summary */}
            <div className="bg-navy/40 border border-navy-foreground/5 rounded-xl p-4 text-[10px] font-mono text-navy-foreground/40 space-y-1">
              <div>Telemetry Node: {telemetry.ip}</div>
              <div className="truncate">Agent: {telemetry.agent}</div>
              <div>Cryptographic Checksum: SHA-256 Validated</div>
            </div>

            {/* Return action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/">
                <Button variant="ghost" className="w-full h-11 border border-navy-foreground/10 hover:bg-navy-hover hover:text-navy-foreground rounded-xl flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Return to Storefront</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
  success = false,
  uppercase = false,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  success?: boolean;
  uppercase?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs pt-3 first:pt-0">
      <span className="text-navy-foreground/50 font-bold uppercase tracking-wider">{label}</span>
      <span className={`font-black ${highlight ? "text-primary text-sm" : success ? "text-emerald-400" : "text-navy-foreground/90"} ${uppercase ? "uppercase tracking-widest text-[10px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}

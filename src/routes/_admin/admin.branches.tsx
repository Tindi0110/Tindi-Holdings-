import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  listAdminBranches,
  upsertBranch,
  deleteBranch,
  listStockTransfers,
  createStockTransfer,
  updateStockTransferStatus,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Sparkles,
  ArrowRightLeft,
  Truck,
  CheckCircle,
  Package,
  RefreshCw,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/_admin/admin/branches")({
  head: () => ({
    meta: [
      { title: "Multi-Branch & Inter-Branch Transfers — Tindi Holdings Ltd" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BranchesAdmin,
});

type Form = { id?: string; name: string; address: string; phone: string; is_active: boolean };
const empty: Form = { name: "", address: "", phone: "", is_active: true };

function BranchesAdmin() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"branches" | "transfers">("branches");

  // Branches query
  const {
    data: branches,
    isLoading: branchesLoading,
    refetch: refetchBranches,
  } = useQuery({
    queryKey: ["admin", "branches"],
    queryFn: () => listAdminBranches(),
  });

  // Transfers query
  const {
    data: transfersData,
    isLoading: transfersLoading,
    refetch: refetchTransfers,
  } = useQuery({
    queryKey: ["admin", "stock_transfers"],
    queryFn: () => listStockTransfers(),
  });

  // Branch Modal Form
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  // Transfer Modal Form
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    from_branch_id: "",
    to_branch_id: "",
    product_id: "",
    quantity: 10,
    courier_name: "Speedaf Express",
    tracking_number: "",
    notes: "",
  });

  const save = useMutation({
    mutationFn: () =>
      upsertBranch({ data: { ...form, address: form.address || null, phone: form.phone || null } }),
    onSuccess: () => {
      toast.success("Operational center saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "branches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteBranch({ data: { id } }),
    onSuccess: () => {
      toast.success("Branch removed from registry");
      qc.invalidateQueries({ queryKey: ["admin", "branches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createTransferMut = useMutation({
    mutationFn: (data: any) => createStockTransfer({ data }),
    onSuccess: (res: any) => {
      toast.success(`Transfer ${res.transfer_number} initialized & dispatched!`);
      setIsTransferModalOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "stock_transfers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateTransferStatusMut = useMutation({
    mutationFn: (vars: { id: string; status: "in_transit" | "received" | "rejected" }) =>
      updateStockTransferStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Stock transfer status verified & inventory reconciled");
      qc.invalidateQueries({ queryKey: ["admin", "stock_transfers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const transfers = transfersData?.transfers ?? [];
  const products = transfersData?.products ?? [];

  return (
    <AdminShell title="Multi-Branch & Logistics">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Enterprise Logistics
                </span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {branches?.length ?? 0} Active Nodes
                </span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground mt-0.5">
                Multi-Branch Node Network
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 bg-muted/40 rounded-xl border border-border">
              <button
                onClick={() => setActiveTab("branches")}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "branches"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Branch Nodes ({branches?.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("transfers")}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "transfers"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Inter-Branch Transfers (
                {transfers.filter((t: any) => t.status === "in_transit").length} Live)
              </button>
            </div>

            {activeTab === "branches" ? (
              <Button
                onClick={() => {
                  setForm(empty);
                  setOpen(true);
                }}
                className="rounded-xl px-5 h-10 bg-primary font-black uppercase text-xs tracking-wider shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add Branch
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setTransferForm({
                    from_branch_id: branches?.[0]?.id || "",
                    to_branch_id: branches?.[1]?.id || "",
                    product_id: products?.[0]?.id || "",
                    quantity: 20,
                    courier_name: "Speedaf Express",
                    tracking_number: `SP-${Math.floor(100000 + Math.random() * 900000)}-KE`,
                    notes: "Urgent inventory restock",
                  });
                  setIsTransferModalOpen(true);
                }}
                className="rounded-xl px-5 h-10 bg-primary font-black uppercase text-xs tracking-wider shadow-sm"
              >
                <Truck className="h-4 w-4 mr-1.5" /> Initialize Transfer
              </Button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: BRANCH NODES
           ══════════════════════════════════════════════════════════ */}
        {activeTab === "branches" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(branches ?? []).map((b) => (
                <div
                  key={b.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center font-black text-sm">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{b.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            b.is_active
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${b.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`}
                          />
                          {b.is_active ? "Online / Active Node" : "Dormant"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setForm({
                            id: b.id,
                            name: b.name,
                            address: b.address ?? "",
                            phone: b.phone ?? "",
                            is_active: b.is_active,
                          });
                          setOpen(true);
                        }}
                        className="h-8 w-8 grid place-items-center rounded-lg bg-muted/60 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        title="Edit Node"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove operational node "${b.name}"?`)) del.mutate(b.id);
                        }}
                        className="h-8 w-8 grid place-items-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete Node"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">
                        {b.address || "Main Commercial Center, Kenya"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="font-mono">{b.phone || "+254 700 000 000"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: INTER-BRANCH STOCK TRANSFERS
           ══════════════════════════════════════════════════════════ */}
        {activeTab === "transfers" && (
          <div className="space-y-5">
            {/* KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Total Transfer Records
                </span>
                <div className="text-2xl font-black text-foreground mt-1">{transfers.length}</div>
                <p className="text-[11px] text-primary font-semibold mt-0.5">
                  Inter-Branch Shipments
                </p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  In Transit
                </span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {transfers.filter((t: any) => t.status === "in_transit").length}
                </div>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  Dispatched on Road
                </p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Received & Stocked
                </span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {transfers.filter((t: any) => t.status === "received").length}
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Inventory Reconciled
                </p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Active Couriers
                </span>
                <div className="text-2xl font-black text-primary mt-1">Speedaf, Fargo, G4S</div>
                <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                  Logistics Partners
                </p>
              </div>
            </div>

            {/* Transfers Table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-muted/20 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">Transfer #</th>
                      <th className="px-6 py-4">Route (From ➔ To)</th>
                      <th className="px-6 py-4">Product SKU & Qty</th>
                      <th className="px-6 py-4">Courier & Waybill</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Dispatched Date</th>
                      <th className="px-6 py-4 text-right">Sign-Off Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {transfers.map((t: any) => (
                      <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-black text-primary text-xs tracking-wider bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                            {t.transfer_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <span>{t.from_branch_name}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-primary font-black">{t.to_branch_name}</span>
                          </div>
                          {t.notes && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                              {t.notes}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-foreground">{t.product_name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            SKU: {t.sku} •{" "}
                            <strong className="text-primary font-bold font-sans">
                              {t.quantity} Units
                            </strong>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-foreground">
                            {t.courier_name || "In-House Logistics"}
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {t.tracking_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                              t.status === "received"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : t.status === "in_transit"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                          >
                            {t.status === "in_transit"
                              ? "⚡ In Transit"
                              : t.status === "received"
                                ? "✓ Received"
                                : "Rejected"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString("en-KE")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {t.status === "in_transit" ? (
                            <button
                              onClick={() =>
                                updateTransferStatusMut.mutate({ id: t.id, status: "received" })
                              }
                              disabled={updateTransferStatusMut.isPending}
                              className="h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-xs font-black inline-flex items-center gap-1 cursor-pointer border border-emerald-500/20"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Sign-Off & Receive
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold inline-flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Reconciled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE BRANCH MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">
              {form.id ? "Edit Operational Node" : "Provision New Branch Node"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                Branch Name *
              </label>
              <input
                required
                placeholder="e.g. Mombasa Central Logistics Hub"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                Physical Address
              </label>
              <input
                placeholder="e.g. Nyali Commercial Plaza, Links Road"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                Contact Phone
              </label>
              <input
                placeholder="+254 700 000 000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-bold pt-1">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary"
              />{" "}
              Active Operational Node
            </label>
            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={save.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                {save.isPending ? "Saving…" : "Save Node"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* INITIALIZE INTER-BRANCH TRANSFER MODAL */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">
              Initialize Inter-Branch Stock Transfer
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Reallocate catalog inventory between regional nodes with courier waybill tracking.
            </p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!transferForm.from_branch_id || !transferForm.to_branch_id) {
                return toast.error("Select both origin and destination branches");
              }
              if (transferForm.from_branch_id === transferForm.to_branch_id) {
                return toast.error("Origin and destination branches must be different");
              }
              const selectedProd =
                products.find((p: any) => p.id === transferForm.product_id) || products[0];
              createTransferMut.mutate({
                ...transferForm,
                product_id: selectedProd?.id || "p-1",
                product_name: selectedProd?.name || "Catalog Item",
                sku: selectedProd?.sku || "SKU-PROD",
                quantity: Number(transferForm.quantity),
              });
            }}
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Origin Branch (From) *
                </label>
                <select
                  value={transferForm.from_branch_id}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, from_branch_id: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  {(branches ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Destination (To) *
                </label>
                <select
                  value={transferForm.to_branch_id}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, to_branch_id: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  {(branches ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Catalog Product SKU *
                </label>
                <select
                  value={transferForm.product_id}
                  onChange={(e) => setTransferForm({ ...transferForm, product_id: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku || "No SKU"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Transfer Qty *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferForm.quantity}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      quantity: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Transit Courier
                </label>
                <select
                  value={transferForm.courier_name}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, courier_name: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  <option value="Speedaf Express">Speedaf Express Kenya</option>
                  <option value="Fargo Courier">Fargo Courier Kenya</option>
                  <option value="G4S Kenya">G4S Logistics</option>
                  <option value="Sendy Logistics">Sendy Direct</option>
                  <option value="In-House Dedicated Rider">In-House Dedicated Rider</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Waybill / Tracking #
                </label>
                <input
                  value={transferForm.tracking_number}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, tracking_number: e.target.value })
                  }
                  placeholder="e.g. SP-908123-KE"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                Dispatch Notes
              </label>
              <input
                value={transferForm.notes}
                onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                placeholder="e.g. Authorized stock reallocation for weekend rush"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-semibold"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTransferModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTransferMut.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                {createTransferMut.isPending ? "Dispatching…" : "Dispatch Stock Transfer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

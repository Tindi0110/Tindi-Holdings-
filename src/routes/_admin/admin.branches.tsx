import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { listAdminBranches, upsertBranch, deleteBranch } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, MapPin, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/_admin/admin/branches")({
  head: () => ({
    meta: [{ title: "Operational Centers — Tindi Group" }, { name: "robots", content: "noindex" }],
  }),
  component: BranchesAdmin,
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

type Form = { id?: string; name: string; address: string; phone: string; is_active: boolean };
const empty: Form = { name: "", address: "", phone: "", is_active: true };

function BranchesAdmin() {
  const qc = useQueryClient();
  const { data: branches } = useQuery({
    queryKey: ["admin", "branches"],
    queryFn: () => listAdminBranches(),
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  const save = useMutation({
    mutationFn: () =>
      upsertBranch({ data: { ...form, address: form.address || null, phone: form.phone || null } }),
    onSuccess: () => {
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteBranch({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title="Operational Geography">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-end px-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
                Regional Logistics
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Enterprise Node Network</h2>
          </div>
          <Button
            onClick={() => {
              setForm(empty);
              setOpen(true);
            }}
            className="rounded-xl px-6 h-11 bg-primary shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
          >
            <Plus className="h-4 w-4 mr-2" /> Provision New Center
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl shadow-black/5"
        >
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-muted/30 text-[9px] text-muted-foreground border-b border-border">
                <tr>
                  {[
                    "Operational Unit",
                    "Geographic Coordination",
                    "Signal Channel",
                    "Network Integrity",
                    "Command Controls",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-8 py-5 text-left font-black uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(branches ?? []).map((b) => (
                  <tr key={b.id} className="hover:bg-muted/20 transition-all group">
                    <td className="px-8 py-5 whitespace-nowrap font-black text-foreground/90">
                      {b.name}
                    </td>
                    <td className="px-8 py-5 text-muted-foreground whitespace-nowrap text-xs font-bold font-mono">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 opacity-30" />
                        {b.address ?? "—"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-muted-foreground whitespace-nowrap font-mono text-[10px] uppercase font-black tracking-widest">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 opacity-30" />
                        {b.phone ?? "—"}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-tighter shadow-sm ${b.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                      >
                        {b.is_active ? "Online" : "Dormant"}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
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
                          className="h-10 w-10 grid place-items-center rounded-xl bg-muted/50 hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `CRITICAL WARNING: Termination of Operational Unit "${b.name}" requested. This will disconnect all localized telemetry.`,
                              )
                            )
                              del.mutate(b.id);
                          }}
                          className="h-10 w-10 grid place-items-center rounded-xl bg-error/5 text-error/60 hover:bg-error hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Branch" : "New Branch"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="space-y-3"
          >
            <Field label="Name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm"
              />
            </Field>
            <Field label="Address">
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm"
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-[var(--color-primary)]"
              />{" "}
              Active
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1">{label}</label>
      {children}
    </div>
  );
}

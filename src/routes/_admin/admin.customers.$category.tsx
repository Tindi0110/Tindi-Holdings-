import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  UserCheck,
  Pencil,
  Trash2,
  Sparkles,
  Filter,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCustomerAnalytics, deleteProfile, updateProfile } from "@/lib/admin.functions";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/_admin/admin/customers/$category")({
  component: CustomersCategoryPage,
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

function Activity(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function CustomersCategoryPage() {
  const { category } = Route.useParams();
  const title = category.charAt(0).toUpperCase() + category.slice(1);

  // SSR-safe: detect whether this is the leaf match (no $sub active)
  const isLeaf = useRouterState({
    select: (state) => state.matches[state.matches.length - 1]?.routeId === Route.id,
  });

  // When a $sub child route is active, delegate to it
  if (!isLeaf) return <Outlet />;
  const qc = useQueryClient();

  const { data: customersData, isLoading } = useQuery({
    queryKey: ["admin", "customers", "analytics"],
    queryFn: () => getCustomerAnalytics(),
  });

  const [editUser, setEditUser] = useState<{ id: string; full_name: string } | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteProfile({ data: { id } }),
    onSuccess: () => {
      toast.success("Customer deleted");
      qc.invalidateQueries({ queryKey: ["admin", "customers", "analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upd = useMutation({
    mutationFn: (vars: { id: string; full_name: string }) => updateProfile({ data: vars }),
    onSuccess: () => {
      toast.success("Customer updated");
      setEditUser(null);
      qc.invalidateQueries({ queryKey: ["admin", "customers", "analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const customers = customersData?.recent || [];

  return (
    <AdminShell title={`Client Network: ${title}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-end px-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-conversion animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
                Global Outreach
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{title} Engagement Registry</h2>
          </div>
          <div className="flex gap-4">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-card px-6 py-3 rounded-2xl border border-border shadow-sm flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-conversion/10 text-conversion grid place-items-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                  Total Nodes
                </div>
                <div className="text-lg font-black leading-none mt-1">
                  {customersData?.total ?? "—"}
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-card px-6 py-3 rounded-2xl border border-border shadow-sm flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-success/10 text-success grid place-items-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                  Growth Velocity
                </div>
                <div className="text-lg font-black leading-none mt-1 text-success">
                  +{customersData?.growth?.[customersData.growth.length - 1]?.count ?? 0}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center justify-between gap-4 px-1"
        >
          <div className="relative flex-1 w-full max-w-lg group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              placeholder={`Identify ${category} signature...`}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-card text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded border border-border bg-muted/30 text-[9px] font-black">
                ⌘
              </kbd>
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded border border-border bg-muted/30 text-[9px] font-black">
                F
              </kbd>
            </div>
          </div>
          <Button
            className="rounded-xl h-12 px-6 bg-primary shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
            onClick={() =>
              toast.info("Manual client registration is handled via secure portal entry.")
            }
          >
            <UserPlus className="h-4 w-4 mr-2" /> Initialize New Node
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-xl shadow-black/5"
        >
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-muted/30 text-[9px] text-muted-foreground text-left border-b border-border">
                <tr>
                  <th className="px-8 py-5 font-black uppercase tracking-widest">
                    Subscriber Identity
                  </th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest">
                    Protocol Integrity
                  </th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest">Registry Date</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest text-right">
                    System Control
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Activity className="h-8 w-8 text-primary animate-spin opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                          Parsing Registry Clusters...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {customers.map(
                  (c: { id: string; full_name: string | null; created_at: string }) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary font-black grid place-items-center shrink-0 border border-primary/10 group-hover:scale-110 transition-transform">
                            {(c.full_name ?? "U").charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-sm text-foreground/90">
                              {c.full_name ?? "Unidentified Unit"}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                              {c.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter bg-success/10 text-success shadow-sm">
                          <Shield className="h-3 w-3" /> Integrity Verified
                        </span>
                      </td>
                      <td className="px-8 py-5 text-muted-foreground whitespace-nowrap text-xs font-bold font-mono">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <button
                            className="h-10 w-10 grid place-items-center rounded-xl bg-muted/50 hover:bg-primary hover:text-white transition-all shadow-sm"
                            onClick={() => setEditUser({ id: c.id, full_name: c.full_name ?? "" })}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="h-10 w-10 grid place-items-center rounded-xl bg-error/5 text-error/60 hover:bg-error hover:text-white transition-all shadow-sm"
                            onClick={() => {
                              if (
                                confirm(
                                  "SYSTEM OVERRIDE: Permanently terminate client node record? This purge is terminal.",
                                )
                              ) {
                                del.mutate(c.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
                {!isLoading && customers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-muted/30 grid place-items-center opacity-30">
                          <Users className="h-8 w-8" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                          Zero Node Signatures
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-5 border-t border-border bg-muted/5 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
              Mapping {customers.length} of {customersData?.total ?? 0} Global Nodes
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg font-black text-[10px] uppercase tracking-widest"
                disabled
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg font-black text-[10px] uppercase tracking-widest"
                disabled
              >
                Next
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Full Name
              </label>
              <input
                value={editUser?.full_name ?? ""}
                onChange={(e) =>
                  setEditUser((prev) => (prev ? { ...prev, full_name: e.target.value } : null))
                }
                className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={() => editUser && upd.mutate(editUser)} disabled={upd.isPending}>
              {upd.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

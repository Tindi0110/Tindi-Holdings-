import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { listAdminOrders, updateOrderStatus } from "@/lib/admin.functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MoreHorizontal, ShoppingCart, Sparkles, Filter } from "lucide-react";
import { motion } from "motion/react";
import { z } from "zod";

const ordersSearchSchema = z.object({
  status: z.string().optional(),
});

export const Route = createFileRoute("/_admin/admin/orders")({
  validateSearch: ordersSearchSchema,
  head: () => ({
    meta: [{ title: "Dispatch Registry — Tindi Holdings Limited" }, { name: "robots", content: "noindex" }],
  }),
  component: OrdersAdmin,
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

const STATUSES = [
  "pending",
  "processing",
  "dispatched",
  "completed",
  "cancelled",
] as const;

const statusColor: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-conversion/10 text-conversion",
  dispatched: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
};

const mapStatusToDb = (status: string) => {
  if (status === "dispatched") return "shipped";
  if (status === "completed") return "delivered";
  return status;
};

const mapStatusToUi = (status: string) => {
  if (status === "shipped") return "dispatched";
  if (status === "delivered") return "completed";
  return status;
};

function OrdersAdmin() {
  const queryClient = useQueryClient();
  const { status: statusParam } = Route.useSearch();
  const filter = statusParam || "all";

  const { data: orders } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => listAdminOrders(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) =>
      updateOrderStatus({
        data: {
          id: vars.id,
          status: mapStatusToDb(vars.status),
        },
      }),
    onSuccess: () => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allOrders = orders ?? [];
  const orderCounts: Record<string, number> = { all: allOrders.length };
  for (const s of STATUSES) {
    const dbVal = mapStatusToDb(s);
    orderCounts[s] = allOrders.filter((o) => o.status === dbVal).length;
  }

  const filteredOrders =
    filter === "all"
      ? allOrders
      : allOrders.filter((o) => o.status === mapStatusToDb(filter));

  return (
    <AdminShell title="Command Dispatch">
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
                Logistics Flow
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Global Dispatch Hub</h2>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl shadow-black/5"
        >
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-muted/30 text-[9px] text-muted-foreground border-b border-border">
                <tr>
                  {[
                    "Order Cluster",
                    "Consignee Node",
                    "Event Timestamp",
                    "Protocol",
                    "Valuation",
                    "Process Status",
                    "Management",
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
                {filteredOrders.map((o) => {
                  const uiStatus = mapStatusToUi(o.status);
                  return (
                    <tr key={o.id} className="hover:bg-muted/20 transition-all group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-black text-primary">#{o.order_number}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap font-bold text-foreground/90">
                        {o.shipping_name ?? "—"}
                      </td>
                      <td className="px-8 py-5 text-muted-foreground whitespace-nowrap text-xs font-medium">
                        {new Date(o.created_at).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 uppercase text-[10px] font-black whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-muted/50 border border-border text-muted-foreground/80">
                          {o.payment_method}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black whitespace-nowrap text-base">
                        KES {Number(o.total).toLocaleString()}
                      </td>
                      <td className="px-8 py-5">
                        <Select
                          value={uiStatus}
                          onValueChange={(v) => updateStatusMutation.mutate({ id: o.id, status: v })}
                        >
                          <SelectTrigger
                            className={`h-9 w-36 text-[10px] font-black uppercase rounded-xl border-none shadow-none ring-1 ring-border focus:ring-primary/20 ${statusColor[uiStatus] ?? ""}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-card">
                            {STATUSES.map((s) => (
                              <SelectItem
                                key={s}
                                value={s}
                                className="capitalize text-[10px] font-black tracking-widest py-2"
                              >
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <button
                            className="h-10 w-10 grid place-items-center rounded-xl bg-muted/50 hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="View Detailed Analytics"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-20 w-20 rounded-[2rem] bg-muted/30 grid place-items-center mb-2 relative">
                          <Sparkles className="h-10 w-10 text-muted-foreground/20 animate-pulse" />
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[2rem]" />
                        </div>
                        <p className="font-black text-sm uppercase tracking-widest text-muted-foreground">
                          Zero Dispatch Signal
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 max-w-[200px] leading-relaxed uppercase font-bold tracking-widest">
                          No matching registry records identified within current parameters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AdminShell>
  );
}

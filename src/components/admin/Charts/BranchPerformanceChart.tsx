import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";
import { TrendingUp, Sparkles, Building2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBranchAnalytics } from "@/lib/admin.functions";

export function BranchPerformanceChart() {
  const { data: branchData, isLoading } = useQuery({
    queryKey: ["admin", "branches", "analytics"],
    queryFn: () => getBranchAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="w-full h-[450px] bg-card border border-border rounded-[2.5rem] p-10 shadow-xl shadow-black/5 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const chartData =
    branchData?.map((b) => ({
      name: b.name,
      revenue: b.revenue,
      orders: b.orders,
    })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-xl shadow-black/5 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Building2 className="h-48 w-48 -mr-12 -mt-12" />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              Node Analysis
            </span>
          </div>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
            Branch Revenue Comparison
            <TrendingUp className="h-6 w-6 text-primary/40" />
          </h3>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground opacity-60">
            Real-time revenue metrics compiled across active branch nodes
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-muted border border-border flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Live DB Synced
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-[350px] -ml-4">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center border border-dashed border-border rounded-2xl text-muted-foreground text-sm font-bold uppercase tracking-widest">
            Awaiting Branch Transaction Data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="color-mix(in oklab, var(--color-border) 60%, transparent)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontWeight: "900" }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontWeight: "900" }}
                tickFormatter={(val) => `$${val.toLocaleString()}`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: "800",
                  color: "var(--color-foreground)",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                  padding: "16px",
                  border: "1px solid var(--color-border)",
                }}
                formatter={(value: any) => [
                  `KES ${Number(value).toLocaleString("en-KE")}`,
                  "Revenue",
                ]}
                cursor={{ fill: "rgba(0, 0, 0, 0.02)" }}
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-primary)"
                radius={[12, 12, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-12 flex flex-wrap gap-10 items-center justify-between border-t border-border pt-10">
        <div className="flex gap-10">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1">
              Active Nodes
            </div>
            <div className="text-sm font-black tracking-tight">
              {chartData.length} branches connected
            </div>
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1">
              Total orders
            </div>
            <div className="text-sm font-black tracking-tight">
              {chartData.reduce((acc, curr) => acc + curr.orders, 0)} completed cycles
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

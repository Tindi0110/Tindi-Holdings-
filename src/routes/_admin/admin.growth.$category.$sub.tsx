import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { Sparkles, Megaphone, Target, Zap, Rocket, TrendingUp, Cpu, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export const Route = createFileRoute("/_admin/admin/growth/$category/$sub")({
  component: GrowthPage,
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function GrowthPage() {
  const { category, sub } = Route.useParams();
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const subTitle = sub
    .replace(/-/g, " ")
    .split(" ")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <AdminShell title={`Velocity: ${subTitle}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden bg-card border border-border p-10 rounded-[2.5rem] shadow-xl shadow-black/5"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Rocket className="h-64 w-64 -mr-12 -mt-12 -rotate-12" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Strategic Expansion
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight leading-none mb-4">
              Accelerate {subTitle} Sub-Sector Velocity
            </h2>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed opacity-70">
              Utilize predictive enterprise growth frameworks to expand node reach and optimize
              conversion trajectories across the {category} cluster.
            </p>
            <div className="mt-8 flex gap-4">
              <Button className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">
                Deploy Growth Initiative
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-widest border-border"
              >
                Performance Topology
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricBox
            title="Signal Reach"
            value="45.2k"
            sub="↑ Velocity 12%"
            icon={Megaphone}
            color="primary"
          />
          <MetricBox
            title="Conversion Trajectory"
            value="3.4%"
            sub="↑ Delta 0.5%"
            icon={Target}
            color="conversion"
          />
          <MetricBox
            title="System Efficiency"
            value="88%"
            sub="AI Synchronized"
            icon={Zap}
            color="warning"
          />
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-[2.5rem] p-10 shadow-xl shadow-black/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Cpu className="h-24 w-24 text-muted-foreground/30 animate-pulse" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">
            Operation Logs
          </h3>
          <h4 className="text-xl font-black mb-10 tracking-tight">
            Recent {catTitle} Cluster Activity
          </h4>
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 grid place-items-center shrink-0 border border-border group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-foreground/80 lowercase tracking-tight">
                      {subTitle} Growth Protocol #{i}04-Alpha
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                      2 Phases Prior
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/30 rounded-full mt-3 overflow-hidden border border-border/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${30 + i * 20}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                      className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full h-12 mt-12 rounded-2xl bg-muted/30 text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-colors border border-border">
            Access Full Diagnostic Stream
          </button>
        </motion.div>
      </motion.div>
    </AdminShell>
  );
}

interface MetricBoxProps {
  title: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "conversion" | "warning";
}

function MetricBox({ title, value, sub, icon: Icon, color }: MetricBoxProps) {
  const colors: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    conversion: "bg-conversion/10 text-conversion",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="bg-card border border-border rounded-[2rem] p-8 shadow-sm group hover:border-primary/40 transition-all"
    >
      <div
        className={`h-14 w-14 rounded-2xl grid place-items-center mb-6 shadow-inner ${colors[color]}`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <div className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground opacity-50">
        {title}
      </div>
      <div className="text-3xl font-black mt-2 tracking-tighter">{value}</div>
      <div className="flex items-center gap-1.5 mt-3">
        <span className="h-1 w-1 rounded-full bg-success" />
        <div className="text-[10px] font-black uppercase tracking-widest text-success">{sub}</div>
      </div>
    </motion.div>
  );
}

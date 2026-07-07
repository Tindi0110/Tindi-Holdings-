import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Shield,
  Settings,
  Activity,
  Database,
  Key,
  Server,
  ShoppingCart,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSystemActivity } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/system/$category/$sub")({
  component: SystemPage,
});

function SystemPage() {
  const { category, sub } = Route.useParams();
  const subTitle = sub
    .replace(/-/g, " ")
    .split(" ")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const { data: activity, isLoading } = useQuery({
    queryKey: ["admin", "system", "activity"],
    queryFn: () => getSystemActivity(),
  });

  return (
    <AdminShell title={`System: ${subTitle}`}>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{subTitle} Overview</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Critical system components and security settings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-bold text-success uppercase">System Healthy</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SystemCard title="Uptime" value="99.99%" icon={Server} />
          <SystemCard title="Database" value="Connected" icon={Database} status="ok" />
          <SystemCard title="API Latency" value="24ms" icon={Activity} />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-section/30 flex items-center justify-between">
            <h3 className="font-bold">Recent System Activity</h3>
            <Button variant="ghost" size="sm">
              Refresh Logs
            </Button>
          </div>
          <div className="divide-y divide-border">
            {isLoading && (
              <div className="px-6 py-12 text-center text-muted-foreground">
                Loading activity...
              </div>
            )}
            {activity?.map(
              (log: {
                id: string;
                type: string;
                label: string;
                time: string;
                value?: string;
              }) => (
                <div
                  key={log.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-section/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-8 w-8 rounded-lg grid place-items-center ${
                        log.type === "order"
                          ? "bg-primary/10 text-primary"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {log.type === "order" ? (
                        <ShoppingCart className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{log.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(log.time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {log.value && <div className="text-sm font-bold">{log.value}</div>}
                </div>
              ),
            )}
            {!isLoading && (!activity || activity.length === 0) && (
              <div className="px-6 py-12 text-center text-muted-foreground">
                No recent activity detected.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

interface SystemCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  status: string;
}

function SystemCard({ title, value, icon: Icon, status }: SystemCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 bg-muted rounded-xl grid place-items-center">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        {status === "ok" && <span className="h-2 w-2 rounded-full bg-success" />}
      </div>
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {title}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

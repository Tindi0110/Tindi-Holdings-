import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { useQuery } from "@tanstack/react-query";
import { getSystemActivity } from "@/lib/admin.functions";
import {
  Activity, ShoppingCart, Package, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export const Route = createFileRoute("/_admin/admin/system/$category")({
  component: SystemCategoryPage,
});

function SystemCategoryPage() {
  const { category } = Route.useParams();
  const navigate = useNavigate();

  // SSR-safe: detect whether this is the leaf match (no $sub active)
  const isLeaf = useRouterState({
    select: (state) => state.matches[state.matches.length - 1]?.routeId === Route.id,
  });

  useEffect(() => {
    if (!isLeaf) return;
    if (category === "users") {
      navigate({ to: "/admin/system/users/admin" as any, replace: true });
    } else if (category === "settings") {
      navigate({ to: "/admin/system/settings/general" as any, replace: true });
    } else if (category === "logs") {
      navigate({ to: "/admin/system/logs/activity" as any, replace: true });
    }
  }, [category, isLeaf, navigate]);

  // When a $sub route is active, render it via Outlet
  if (!isLeaf) {
    return <Outlet />;
  }

  return <SystemCategoryView category={category} />;
}

function SystemCategoryView({ category }: { category: string }) {
  const title = category.charAt(0).toUpperCase() + category.slice(1);

  // Fallback: render the activity page for /admin/system/activity
  const { data: activity, isLoading, refetch } = useQuery({
    queryKey: ["admin", "system", "activity"],
    queryFn: () => getSystemActivity(),
    enabled: category === "activity",
  });

  return (
    <AdminShell title={`System: ${title}`}>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{title} Monitor</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Viewing live system status and operational telemetry.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-bold text-success uppercase">Active Sync</span>
          </div>
        </div>

        {category === "activity" ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-section/30 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider">Recent Activity Logs</h3>
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-xs font-bold flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh Logs
              </Button>
            </div>
            <div className="divide-y divide-border">
              {isLoading && (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  Loading activity logs...
                </div>
              )}
              {activity?.map((log: any) => (
                <div
                  key={log.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-section/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${
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
                      <div className="text-sm font-semibold text-foreground">{log.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(log.time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {log.value && <div className="text-sm font-black text-primary">{log.value}</div>}
                </div>
              ))}
              {!isLoading && (!activity || activity.length === 0) && (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  No recent activity detected.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Security Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-section rounded-lg font-medium text-sm">
                  <span>Firewall</span>
                  <span className="text-success font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-section rounded-lg font-medium text-sm">
                  <span>Intrusion Detection</span>
                  <span className="text-success font-bold">Monitoring</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Maintenance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-section rounded-lg font-medium text-sm">
                  <span>Last Backup</span>
                  <span className="text-muted-foreground font-bold">4h ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-section rounded-lg font-medium text-sm">
                  <span>Next Window</span>
                  <span className="text-muted-foreground font-bold">Sunday 02:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

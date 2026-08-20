import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { Rocket, Megaphone, Percent, Users } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_admin/admin/growth/$category")({
  component: GrowthCategoryPage,
});

function GrowthCategoryPage() {
  const { category } = Route.useParams();
  const navigate = useNavigate();

  // SSR-safe: detect whether this is the leaf match (no $sub active)
  const isLeaf = useRouterState({
    select: (state) => state.matches[state.matches.length - 1]?.routeId === Route.id,
  });

  useEffect(() => {
    if (!isLeaf) return;
    if (category === "coupons") {
      navigate({ to: "/admin/growth/coupons/all" as any, replace: true });
    } else if (category === "marketing") {
      navigate({ to: "/admin/growth/marketing/email" as any, replace: true });
    } else if (category === "referrals") {
      navigate({ to: "/admin/growth/marketing/referral" as any, replace: true });
    }
  }, [category, isLeaf, navigate]);

  // When a $sub route is active, render it via Outlet
  if (!isLeaf) {
    return <Outlet />;
  }

  const title = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <AdminShell title={`Growth: ${title}`}>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">{title} Management</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Redirecting to active growth sub-channel...
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

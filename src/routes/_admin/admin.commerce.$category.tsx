import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_admin/admin/commerce/$category")({
  component: CommerceCategoryPage,
});

function CommerceCategoryPage() {
  const { category } = Route.useParams();
  const navigate = useNavigate();

  // Check if this parent route is the leaf match (meaning no $sub route is active)
  const isLeaf = useRouterState({
    select: (state) => state.matches[state.matches.length - 1]?.routeId === Route.id,
  });

  useEffect(() => {
    if (!isLeaf) return;

    if (category === "categories") {
      navigate({ to: "/admin/commerce/categories/all" as any, replace: true });
    } else if (category === "inventory") {
      navigate({ to: "/admin/commerce/inventory/stock" as any, replace: true });
    } else if (category === "branches") {
      navigate({ to: "/admin/commerce/branches/analytics" as any, replace: true });
    } else if (category === "products") {
      navigate({ to: "/admin/commerce/products/drafts" as any, replace: true });
    } else if (category === "orders") {
      navigate({ to: "/admin/commerce/orders/refunds" as any, replace: true });
    }
  }, [category, isLeaf, navigate]);

  return <Outlet />;
}

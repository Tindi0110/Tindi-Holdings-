import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_admin/admin/commerce/$category")({
  component: CommerceCategoryPage,
});

function CommerceCategoryPage() {
  const { category } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect when there is no $sub in the URL (i.e., this parent is the
    // leaf match). When the child $sub route is active the Outlet below handles rendering.
    const path = window.location.pathname;
    const segments = path.split("/").filter(Boolean);
    // e.g. ["admin", "commerce", "categories"] — only 3 segments means no sub
    const hasSubSegment = segments.length > 3;
    if (hasSubSegment) return;

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
  }, [category, navigate]);

  // Render the matched child ($sub) route
  return <Outlet />;
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_admin/admin/commerce/$category")({
  component: CommerceCategoryPage,
});

function CommerceCategoryPage() {
  const { category } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
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

  return null;
}

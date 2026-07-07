import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { Star, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/customers/$category/$sub")({
  component: CustomersSubPage,
});

function CustomersSubPage() {
  const { category, sub } = Route.useParams();
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const subTitle = sub.charAt(0).toUpperCase() + sub.slice(1);

  return (
    <AdminShell title={`${catTitle}: ${subTitle}`}>
      <div className="space-y-6">
        <div className="bg-card p-10 border border-border rounded-2xl text-center">
          <div className="h-16 w-16 bg-muted rounded-full grid place-items-center mx-auto mb-6">
            {category === "reviews" ? (
              <Star className="h-8 w-8 text-warning" />
            ) : (
              <MessageSquare className="h-8 w-8 text-primary" />
            )}
          </div>
          <h2 className="text-2xl font-bold">
            Manage {catTitle} {subTitle}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            View and interact with your {category} based on the {sub} filter. This section allows
            for granular management of user-generated content.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-6 bg-card border border-border rounded-2xl flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-success/10 text-success grid place-items-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold">Automated Moderation</h4>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered moderation is currently active and screening {category} for policy
                violations.
              </p>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-error/10 text-error grid place-items-center shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold">Pending Review</h4>
              <p className="text-sm text-muted-foreground mt-1">
                There are 12 items requiring manual verification from your moderation team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

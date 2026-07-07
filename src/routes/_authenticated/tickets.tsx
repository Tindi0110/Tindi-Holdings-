import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cmsStore, SupportTicket } from "@/lib/cms-store";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/tickets")({
  component: MyTicketsPage,
});

function MyTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
        setTickets(cmsStore.getTicketsByEmail(data.user.email));
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorporateHeader onCartOpen={() => {}} />
      <div className="mx-auto max-w-4xl w-full px-6 py-12 flex-1">
        <h1 className="text-3xl font-bold mb-6">My Support Tickets</h1>
        {tickets.length === 0 ? (
          <p>No tickets found for {userEmail}.</p>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-section text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Ticket ID</th>
                  <th className="px-5 py-3 text-left font-medium">Subject</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{t.id}</td>
                    <td className="px-5 py-3">{t.subject}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${t.status === "Open" ? "bg-warning/10 text-warning" : t.status === "Resolved" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link to="/_authenticated/tickets/$id" params={{ id: t.id }}>
                        <u>View</u>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <CorporateFooter />
    </div>
  );
}

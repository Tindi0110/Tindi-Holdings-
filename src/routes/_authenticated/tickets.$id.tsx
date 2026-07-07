import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cmsStore, SupportTicket } from "@/lib/cms-store";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tickets/$id")({
  component: TicketDetailPage,
});

function TicketDetailPage() {
  const { id } = Route.useParams();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, we would fetch ticket by ID. For now just find it.
    const t = cmsStore.getTickets().find((t) => t.id === id);
    setTicket(t || null);
  }, [id]);

  const handleReply = () => {
    if (!ticket || !reply.trim()) return;
    const updated = cmsStore.addMessageToTicket(ticket.id, "customer", reply);
    if (updated) {
      setTicket(updated);
      setReply("");
      toast.success("Reply sent!");
    }
  };

  if (!ticket) return <div>Ticket not found</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorporateHeader onCartOpen={() => {}} />
      <div className="mx-auto max-w-2xl w-full px-6 py-12 flex-1">
        <Button variant="ghost" onClick={() => navigate({ to: "/_authenticated/tickets" })}>
          Back to Tickets
        </Button>
        <h1 className="text-3xl font-bold mb-6">{ticket.subject}</h1>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
            {ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg text-sm ${msg.sender === "customer" ? "bg-primary/10 ml-auto" : "bg-muted"} w-[80%]`}
              >
                {msg.message}
                <div className="text-[10px] text-muted-foreground mt-1">
                  {msg.createdAt} — {msg.sender}
                </div>
              </div>
            ))}
          </div>

          {ticket.status !== "Resolved" && (
            <div className="flex items-center gap-2 pt-4 border-t">
              <input
                className="flex-grow p-2 rounded-lg border border-border bg-background text-sm"
                placeholder="Reply to message..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <Button onClick={handleReply}>Send</Button>
            </div>
          )}
        </div>
      </div>
      <CorporateFooter />
    </div>
  );
}

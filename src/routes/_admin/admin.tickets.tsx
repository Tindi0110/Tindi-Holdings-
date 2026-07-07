import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { cmsStore, SupportTicket } from "@/lib/cms-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_admin/admin/tickets")({
  component: AdminTickets,
});

function AdminTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>(cmsStore.getTickets());
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");

  const handleUpdateStatus = (id: string, status: SupportTicket["status"]) => {
    cmsStore.updateTicketStatus(id, status);
    setTickets(cmsStore.getTickets());
    if (selectedTicket?.id === id) {
      setSelectedTicket({ ...selectedTicket, status });
    }
  };

  const handleReply = () => {
    if (!selectedTicket || !reply.trim()) return;
    const updated = cmsStore.addMessageToTicket(selectedTicket.id, "admin", reply);
    if (updated) {
      setSelectedTicket(updated);
      setTickets(cmsStore.getTickets());
      setReply("");
    }
  };

  return (
    <AdminShell title="Support Tickets">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-section text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Ticket ID</th>
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-border cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTicket(t)}
                >
                  <td className="px-5 py-3 font-medium">{t.id}</td>
                  <td className="px-5 py-3">{t.name}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${t.status === "Open" ? "bg-warning/10 text-warning" : t.status === "Resolved" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedTicket && (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{selectedTicket.subject}</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus(selectedTicket.id, "Resolved")}
                disabled={selectedTicket.status === "Resolved"}
              >
                Resolve
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              From: {selectedTicket.name} ({selectedTicket.email})
            </p>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {selectedTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg text-sm ${msg.sender === "admin" ? "bg-primary/10 ml-auto" : "bg-muted"} w-[80%]`}
                >
                  {msg.message}
                  <div className="text-[10px] text-muted-foreground mt-1">{msg.createdAt}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                className="flex-grow p-2 rounded-lg border border-border bg-background text-sm"
                placeholder="Reply to message..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <Button onClick={handleReply}>Send</Button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

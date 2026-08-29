import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSupportTickets,
  updateSupportTicketStatus,
  replyToSupportTicket,
} from "@/lib/admin.functions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Inbox, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/tickets")({
  component: AdminTickets,
});

function AdminTickets() {
  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const {
    data: tickets = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: () => listSupportTickets(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { id: string; status: "Open" | "In_Progress" | "Resolved" }) =>
      updateSupportTicketStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Ticket status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const replyMutation = useMutation({
    mutationFn: (vars: { ticketId: string; message: string }) =>
      replyToSupportTicket({ data: vars }),
    onSuccess: () => {
      toast.success("Reply dispatched");
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  const handleUpdateStatus = (id: string, status: "Open" | "In_Progress" | "Resolved") => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleReply = () => {
    if (!selectedTicketId || !reply.trim()) return;
    replyMutation.mutate({ ticketId: selectedTicketId, message: reply });
  };

  return (
    <AdminShell title="Support Telemetry">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Support Tickets</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live database queries of user support inquiries.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl flex items-center gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 bg-card rounded-2xl border border-border overflow-hidden shadow-xl shadow-black/5">
            <div className="px-5 py-4 bg-muted/20 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Inbox Registry
            </div>
            {isLoading && (
              <div className="p-8 text-center text-muted-foreground text-xs">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Querying support tables...
              </div>
            )}
            {!isLoading && tickets.length === 0 && (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Inbox className="h-8 w-8 text-muted-foreground/60" />
                <div className="text-xs font-bold uppercase tracking-wider">Inbox is Empty</div>
                <div className="text-[10px]">No support tickets found in the database.</div>
              </div>
            )}
            <div className="divide-y divide-border overflow-y-auto max-h-[600px] data-lenis-prevent">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-5 cursor-pointer transition-colors text-left ${
                    selectedTicketId === t.id
                      ? "bg-primary/5 border-l-2 border-primary"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono text-[10px] font-bold text-primary truncate max-w-[120px]">
                      {t.id.slice(0, 8)}...
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        t.status === "Open"
                          ? "bg-warning/10 text-warning border border-warning/20"
                          : t.status === "Resolved"
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground mt-2 line-clamp-1">
                    {t.subject}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.message}</p>
                  <div className="flex justify-between text-[9px] font-semibold text-muted-foreground/80 mt-3 border-t border-border/50 pt-2">
                    <span>{t.name}</span>
                    <span>{t.createdAt.split(",")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-xl shadow-black/5 flex flex-col h-full min-h-[500px]">
                <div className="flex justify-between items-start border-b border-border pb-4 gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      {selectedTicket.channel} Channel
                    </span>
                    <h3 className="font-black text-xl tracking-tight text-foreground mt-1">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      From: <span className="font-bold text-foreground">{selectedTicket.name}</span>{" "}
                      ({selectedTicket.email}) {selectedTicket.phone && `• ${selectedTicket.phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const rawPhone = selectedTicket.phone || "";
                        const clean = rawPhone.replace(/\D/g, "");
                        const kenyaPhone = clean.startsWith("0")
                          ? `254${clean.slice(1)}`
                          : clean.startsWith("254")
                            ? clean
                            : clean.length === 9
                              ? `254${clean}`
                              : clean;
                        if (!kenyaPhone || kenyaPhone.length < 9) {
                          return toast.error("No valid customer phone number on this ticket");
                        }
                        const msg = `Hello ${selectedTicket.name}, this is Tindi Holdings Customer Support regarding your ticket #${selectedTicket.id.slice(0, 8)} ("${selectedTicket.subject}"). How can we assist you today?`;
                        const url = `https://wa.me/${kenyaPhone}?text=${encodeURIComponent(msg)}`;
                        window.open(url, "_blank");
                        toast.success("WhatsApp support chat opened");
                      }}
                      className="rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5" /> WhatsApp Customer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedTicket.id, "Resolved")}
                      disabled={
                        selectedTicket.status === "Resolved" || updateStatusMutation.isPending
                      }
                      className="rounded-xl text-xs font-bold"
                    >
                      Resolve Ticket
                    </Button>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto max-h-[380px] p-2 bg-muted/5 border border-border/50 rounded-xl data-lenis-prevent">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl text-xs shadow-sm max-w-[85%] border ${
                        msg.sender === "admin"
                          ? "bg-primary text-primary-foreground border-primary/20 ml-auto"
                          : "bg-card text-foreground border-border"
                      }`}
                    >
                      <div className="font-bold text-[9px] uppercase tracking-wider opacity-85 mb-1">
                        {msg.sender === "admin" ? "Tindi Admin" : selectedTicket.name}
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      <div className="text-[8px] opacity-70 mt-2 text-right">{msg.createdAt}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <input
                    className="flex-grow h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Reply to message..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    disabled={replyMutation.isPending}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleReply();
                    }}
                  />
                  <Button
                    onClick={handleReply}
                    disabled={replyMutation.isPending || !reply.trim()}
                    className="rounded-xl h-11 px-6 font-black uppercase text-[10px] tracking-widest"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center gap-4 h-full min-h-[500px] shadow-xl shadow-black/5">
                <div className="h-16 w-16 rounded-2xl bg-muted/20 grid place-items-center">
                  <Inbox className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wider">
                    No Ticket Selected
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Choose a support request from the list to view its conversation history, status,
                    and log official responses.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

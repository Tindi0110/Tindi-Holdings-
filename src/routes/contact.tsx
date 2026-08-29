import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { cmsStore } from "@/lib/cms-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  ShieldCheck,
  Building,
  User,
  Sparkles,
  Bot,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Corporate Board & Support — Tindi Holdings Ltd" },
      {
        name: "description",
        content:
          "Submit technical support tickets, invest pitch decks or dial Tindi Holdings Ltd regional corporate headquarters.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [cartOpen, setCartOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subsidiary, setSubsidiary] = useState("Tindi Tech & Smart Homes");
  const [channel, setChannel] = useState<
    "General" | "Support" | "Partnership" | "Investment" | "Media" | "Careers"
  >("General");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Live Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "bot"; text: string; time: string }>
  >([
    {
      sender: "bot",
      text: "Hello! Welcome to Tindi Holdings Ltd Corporate Support. Ask me anything about our subsidiaries, order statuses, or flight transit tracking.",
      time: "Just Now",
    },
  ]);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill out Name, Email, and Message.");
      return;
    }

    cmsStore.createTicket({
      name,
      email,
      phone: phone || "+254",
      subsidiary,
      channel,
      subject: subject || `${channel} Inquiry`,
      message,
    });

    toast.success(`Support Ticket TND-${Date.now().toString().slice(-4)} cataloged successfully!`);
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const newMsgs = [...chatMessages, { sender: "user" as const, text: userMsg, time: "Just Now" }];
    setChatMessages(newMsgs);
    setChatInput("");

    // Simulate Bot response based on user input
    setTimeout(() => {
      let botResponse =
        "Thank you for messaging. I have checked with the Tindi Board dispatch. Would you like me to connect you with Tindi Safaris tracking or Tindi Apparel custom tailoring design rooms?";
      const lower = userMsg.toLowerCase();
      if (
        lower.includes("track") ||
        lower.includes("safari") ||
        lower.includes("shipping") ||
        lower.includes("freight")
      ) {
        botResponse =
          "Understood. For Tindi Safaris & Logistics fleet tracking, please dial our Mombasa Marina dispatcher directly at +254 41 222000 or submit a 'Partnership' ticket.";
      } else if (
        lower.includes("order") ||
        lower.includes("shop") ||
        lower.includes("buy") ||
        lower.includes("cart")
      ) {
        botResponse =
          "Your active order is processed inside our central database node. You can review shop cart lines in the drawer, or update addresses by filing a general ticket.";
      } else if (
        lower.includes("tech") ||
        lower.includes("smart") ||
        lower.includes("software") ||
        lower.includes("automation")
      ) {
        botResponse =
          "Tindi Tech systems are engineered on private server networks. We are happy to schedule a compliance blueprint consultation. Submit a 'Technical' inquiry request.";
      } else if (lower.includes("apparel") || lower.includes("suit") || lower.includes("uniform")) {
        botResponse =
          "Tindi Apparel design rooms accept bulk sustainable uniform suiting guidelines. Please select Tindi Apparel in our quotation calculator or message design@tindigroup.com.";
      } else if (lower.includes("job") || lower.includes("career") || lower.includes("work")) {
        botResponse =
          "You can apply for senior and graduate roles on our Careers page. A drag-and-drop resume upload system is integrated there for your convenience.";
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: "bot" as const, text: botResponse, time: "Just Now" },
      ]);
    }, 800);
  };

  const offices = [
    {
      city: "Nairobi HQ",
      address: "Tindi Heights, Riverside Drive, Suite 400",
      phone: "+254 20 444000",
      email: "board@tindigroup.com",
    },
    {
      city: "Mombasa Terminal",
      address: "Marina Logistics Port, Hub Section B",
      phone: "+254 41 222000",
      email: "safaris@tindigroup.com",
    },
    {
      city: "Kampala Hub",
      address: "Nakawa Business Park, Block A",
      phone: "+256 414 300000",
      email: "uganda@tindigroup.com",
    },
    {
      city: "Kigali Station",
      address: "Kigali Heights, Level 2, Transit Wing",
      phone: "+250 252 500000",
      email: "rwanda@tindigroup.com",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Banner */}
      <section className="bg-muted border-b border-border py-20 text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 relative">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 border border-primary/10 px-3.5 py-1.5 rounded-full">
            Support Desks
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-4 tracking-tighter text-foreground uppercase">
            Connect With Our Board
          </h1>
          <p className="text-muted-foreground text-[13px] md:text-sm mt-3 max-w-2xl mx-auto leading-relaxed font-medium">
            Reach out via our multi-channel communication systems. File support tickets, pitch joint
            ventures, or connect with regional offices across East Africa.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-20 mx-auto max-w-screen-2xl px-4 md:px-6 w-full flex-1">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Panel: Contact info & Office address cards */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block pl-0.5">
                Corporate Channels
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight">Direct Liaison Inquiries</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We maintain active lines for investment, technical assistance, custom apparel
                designs, and transit scheduling.
              </p>
            </div>

            {/* Inboxes */}
            <div className="space-y-4 pt-2">
              <div className="flex gap-3 items-start">
                <div className="h-9 w-9 bg-primary/10 text-primary rounded-lg grid place-items-center shrink-0">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs uppercase text-slate-800 dark:text-slate-200">
                    Email Inboxes
                  </h4>
                  <span className="text-xs text-primary font-bold block mt-1">
                    board@tindigroup.com
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Checked continuously by the central executive cabinet.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-9 w-9 bg-primary/10 text-primary rounded-lg grid place-items-center shrink-0">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs uppercase text-slate-800 dark:text-slate-200">
                    Switchboard Lines
                  </h4>
                  <span className="text-xs text-primary font-bold block mt-1">+254 20 444000</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Connecting callers to operations teams (08:00 to 17:00 UTC).
                  </p>
                </div>
              </div>
            </div>

            {/* Offices directory */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-extrabold text-xs uppercase text-slate-700 dark:text-slate-300 tracking-widest pl-0.5">
                Regional Offices
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {offices.map((off, i) => (
                  <div key={i} className="p-4 bg-muted rounded-xl border space-y-1">
                    <span className="text-xs font-black text-slate-950 dark:text-white leading-none">
                      {off.city}
                    </span>
                    <p className="text-[10px] text-muted-foreground leading-tight">{off.address}</p>
                    <span className="text-[9px] font-bold text-primary block pt-1 font-mono">
                      {off.phone}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Panel: Support Ticket generator */}
          <div className="lg:col-span-5 p-6 md:p-8 bg-card border rounded-3xl shadow-xl shadow-black/5">
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="border-b pb-4 mb-4">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-sans">
                  Board Ticket System
                </span>
                <h3 className="text-lg font-extrabold tracking-tight mt-1 text-foreground dark:text-white">
                  File Operational support Ticket
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit inquiries straight to our CRM queue systems.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block pl-0.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 border rounded-lg text-xs"
                    placeholder="Candidate / Rep"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block pl-0.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 border rounded-lg text-xs"
                    placeholder="rep@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block pl-0.5">
                    Subsidiary
                  </label>
                  <select
                    value={subsidiary}
                    onChange={(e) => setSubsidiary(e.target.value)}
                    className="w-full h-10 px-2 border text-xs bg-card focus:outline-none rounded-lg"
                  >
                    <option value="Tindi Tech & Smart Homes">Tindi Tech & Smart Homes</option>
                    <option value="Tindi Safaris & Logistics">Tindi Safaris & Logistics</option>
                    <option value="Tindi Eats">Tindi Eats</option>
                    <option value="Tindi Apparel">Tindi Apparel</option>
                    <option value="Tindi Holdings Ltd Board">
                      Tindi Holdings Ltd Holding Board
                    </option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block pl-0.5">
                    Intent / Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full h-10 px-2 border text-xs bg-card focus:outline-none rounded-lg"
                  >
                    <option value="General">General Inquiry</option>
                    <option value="Support">Technical Support</option>
                    <option value="Sales">Sales & Uniform Ordering</option>
                    <option value="Partnership">Joint Venture / Co-Invest</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground block pl-0.5">
                  Subject Heading
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-10 px-3 border rounded-lg text-xs"
                  placeholder="System Integration / Bulk Uniform Query"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground block pl-0.5">
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border rounded-lg text-xs"
                  placeholder="List specific custom parameters, shipment metrics, or proposal details..."
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-xs uppercase tracking-wide bg-primary hover:bg-primary/95 text-white font-bold select-none"
              >
                Dispatch Board Ticket <Send className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </form>
          </div>

          {/* Right Panel: Simulated Live Chat Widget inside box layout! */}
          <div className="lg:col-span-3 bg-card text-foreground rounded-3xl overflow-hidden shadow-xl aspect-[3/4] flex flex-col justify-between border border-border">
            <div className="p-4 bg-muted border-b border-border flex items-center gap-2.5">
              <div className="relative">
                <div className="h-8 w-8 bg-primary rounded-full grid place-items-center text-primary-foreground font-black">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide leading-none uppercase text-foreground">
                  Digital Dispatcher
                </h4>
                <span className="text-[10px] text-emerald-600 block mt-1 font-semibold">
                  Online • Autopilot active
                </span>
              </div>
            </div>

            {/* Messages box */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 font-sans text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-200">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <span className="text-[9px] text-slate-400 mb-0.5 block px-1">
                    {msg.sender === "bot" ? "Tindi Bot" : "You"}
                  </span>
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none font-bold shadow-lg shadow-primary/20"
                        : "bg-muted text-foreground rounded-tl-none border border-border"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat form Input */}
            <form
              onSubmit={handleSendChatMessage}
              className="p-3 bg-muted border-t border-border flex gap-2"
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                type="text"
                className="flex-1 h-9 bg-card border border-border rounded-lg px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Ask tracking, suits, tables..."
              />
              <Button
                type="submit"
                size="sm"
                className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shrink-0 p-0 shadow-lg shadow-primary/10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* WhatsApp Quick Link */}
      <section className="py-8 bg-muted border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 items-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-black uppercase text-emerald-500 tracking-wider">
              Dial-in Instant Chats
            </span>
            <p className="text-muted-foreground text-xs font-semibold pl-2">
              Need immediate roadside safari logistics or dine reservations updates?
            </p>
          </div>
          <a
            href="https://wa.me/254700110000"
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
          >
            <Button
              size="sm"
              className="h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg uppercase tracking-wide px-4"
            >
              Launch Live WhatsApp Chat <MessageSquare className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </a>
        </div>
      </section>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}

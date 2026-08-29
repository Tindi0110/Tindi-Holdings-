import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  RotateCcw,
  Clock,
  Banknote,
  PackageCheck,
  Truck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Sparkles,
  PhoneCall,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/returns-policy")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy — Tindi Holdings Ltd" },
      {
        name: "description",
        content:
          "Learn about Tindi Holdings Ltd 7–14 Day Easy Returns and Instant M-Pesa Refund Guarantee.",
      },
    ],
  }),
  component: ReturnsPolicyPage,
});

function ReturnsPolicyPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How many days do I have to return an item?",
      a: "You have 14 days from the date of delivery to initiate a return request for eligible products (or 7 days for certain promotional electronics). Simply visit 'My Orders' and click 'Request Return / Refund'.",
    },
    {
      q: "How will I receive my refund?",
      a: "You can choose your preferred refund channel during return initiation: 1) Instant M-Pesa refund to your mobile phone, 2) Instant Tindi Store Credit / Shopping Voucher, or 3) Direct Electronic Bank Transfer (1–3 business days).",
    },
    {
      q: "Is there a fee for returns?",
      a: "No! Returns are 100% free if the item received was defective, damaged during transit, missing accessories, or not as described on our website. For change-of-mind returns, free drop-off is available at all our branch hubs across Kenya.",
    },
    {
      q: "How do I hand over my return item?",
      a: "You can choose between: 1) Free Doorstep Courier Pickup (our rider collects directly from your delivery address), or 2) Drop-off at any of our 15+ Tindi Hubs & Station Centers across Nairobi, Mombasa, Kisumu, Nakuru, and Eldoret.",
    },
    {
      q: "What conditions must the returned item meet?",
      a: "The product must be returned in its original brand packaging with all tags, instruction manuals, accessories, and promotional gifts included. Seals must not be broken for software and beauty items unless reporting a manufacturer defect.",
    },
  ];

  const returnReasons = [
    {
      title: "Defective / Doesn't Work",
      desc: "Item has a manufacturer hardware failure or doesn't turn on.",
      badge: "Full Refund / Replace",
    },
    {
      title: "Damaged on Delivery",
      desc: "Package or item arrived with physical dents, scratches, or cracks.",
      badge: "Instant Approval",
    },
    {
      title: "Wrong Item Received",
      desc: "Different product model, color, or specification from order.",
      badge: "Free Express Swap",
    },
    {
      title: "Missing Parts / Accessories",
      desc: "Essential cables, chargers, or components omitted from box.",
      badge: "Fast Resolution",
    },
    {
      title: "Item Not as Described",
      desc: "Significant mismatch between online photos and physical unit.",
      badge: "Guaranteed Return",
    },
    {
      title: "Changed Mind / Wrong Size",
      desc: "Item unopened and unused with original factory seals intact.",
      badge: "Store Credit / Refund",
    },
  ];

  const branchStations = [
    {
      name: "Nairobi CBD Corporate Hub",
      address: "Kimathi Street, Executive Plaza, Ground Floor",
      phone: "+254 700 000 001",
    },
    {
      name: "Westlands Technology Center",
      address: "101 Commercial Way, Westlands, Nairobi",
      phone: "+254 700 000 002",
    },
    {
      name: "Mombasa Road Logistics Hub",
      address: "Gateway Industrial Park, Mombasa Rd",
      phone: "+254 700 000 003",
    },
    { name: "Mombasa Coast Hub", address: "Nyali Links Road, Mombasa", phone: "+254 700 000 004" },
    {
      name: "Kisumu Mega Station",
      address: "Oginga Odinga Street, Kisumu",
      phone: "+254 700 000 005",
    },
    {
      name: "Nakuru Commercial Station",
      address: "Kenyatta Avenue, Nakuru",
      phone: "+254 700 000 006",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-16 px-6">
        <div className="mx-auto max-w-5xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Jumia-Standard 100% Buyer Protection</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-display font-black text-foreground tracking-tight">
            Easy Returns & Instant Refunds Guarantee
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto font-medium">
            Shop with total confidence at Tindi Holdings. If your item isn't right, return it within{" "}
            <strong>14 days</strong> for a fast replacement or instant M-Pesa refund.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
            <Link to="/orders">
              <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider gap-2 shadow-md cursor-pointer">
                <span>Start a Return</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/track-order">
              <Button
                variant="outline"
                className="h-12 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider border-border"
              >
                Track Existing Order
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Guarantees Grid */}
      <section className="py-12 px-6 border-b border-border bg-muted/10">
        <div className="mx-auto max-w-5xl grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border p-6 rounded-3xl space-y-3 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">14-Day Return Window</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Counted from the exact timestamp of delivery for eligible tech & corporate items.
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-3xl space-y-3 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 grid place-items-center">
              <Banknote className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Instant M-Pesa Refunds</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fast disbursement straight to your mobile wallet upon warehouse quality check.
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-3xl space-y-3 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 grid place-items-center">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Free Doorstep Pickup</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our courier rider collects the return package directly from your home or office.
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-3xl space-y-3 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 grid place-items-center">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">15+ Drop-off Stations</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drop off your package at any Tindi Regional Hub across Kenya for priority turnaround.
            </p>
          </div>
        </div>
      </section>

      {/* 4-Step Process (Jumia Flow) */}
      <section className="py-16 px-6 border-b border-border">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-display font-black text-foreground">
              How Returns Work (4 Simple Steps)
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
              Returning an item with Tindi Holdings is seamless and tracked at every step.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-3xl p-6 relative space-y-3 shadow-sm">
              <span className="text-2xl font-black text-primary font-mono">01</span>
              <h4 className="font-bold text-sm text-foreground">Initiate Online</h4>
              <p className="text-xs text-muted-foreground">
                Go to <strong>My Orders</strong>, select your delivered order, choose the item, and
                submit your reason with photos.
              </p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 relative space-y-3 shadow-sm">
              <span className="text-2xl font-black text-primary font-mono">02</span>
              <h4 className="font-bold text-sm text-foreground">Package Handover</h4>
              <p className="text-xs text-muted-foreground">
                Pack item in original box. Hand to our doorstep courier rider or drop off at any
                Tindi branch hub.
              </p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 relative space-y-3 shadow-sm">
              <span className="text-2xl font-black text-primary font-mono">03</span>
              <h4 className="font-bold text-sm text-foreground">Fast Quality Check</h4>
              <p className="text-xs text-muted-foreground">
                Our technicians inspect the returned item at Central Logistics to verify reported
                defects or issues.
              </p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 relative space-y-3 shadow-sm">
              <span className="text-2xl font-black text-emerald-600 font-mono">04</span>
              <h4 className="font-bold text-sm text-foreground">Instant Refund</h4>
              <p className="text-xs text-muted-foreground">
                Receive funds immediately via M-Pesa, store shopping voucher, or bank reversal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligible Reasons */}
      <section className="py-16 px-6 border-b border-border bg-muted/10">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-display font-black text-foreground">
              Eligible Return Reasons
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
              We accept returns under the following verified return scenarios.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {returnReasons.map((r, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-3xl p-5 space-y-2.5 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-foreground">{r.title}</h4>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {r.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drop-off Stations Directory */}
      <section className="py-16 px-6 border-b border-border">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-display font-black text-foreground">
              Regional Drop-off Stations
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
              Bring your return package to any of our regional stations across the country.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branchStations.map((b, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-sm"
              >
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{b.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{b.address}</p>
                <div className="pt-2 text-xs font-mono text-foreground font-semibold flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{b.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Accordion */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-display font-black text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Everything you need to know about our returns and refund protocol.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center text-sm font-bold text-foreground cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      openFaq === idx ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}

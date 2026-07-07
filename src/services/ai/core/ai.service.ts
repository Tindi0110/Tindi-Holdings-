import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: any) => z.object({
    prompt: z.string(),
    context: z.string().optional()
  }).parse(input))
  .handler(async ({ data }) => {
    // Stub assistant responses for Tindi Holdings
    let answer = "I am the Tindi Holdings enterprise assistant. How can I help you manage your storefront operations today?";
    const p = data.prompt.toLowerCase();
    
    if (p.includes("revenue") || p.includes("sales")) {
      answer = "According to your recent analytics reports, sales revenue is holding steady with standard seasonal trends. Branch Mombasa is currently leading in performance.";
    } else if (p.includes("stock") || p.includes("inventory")) {
      answer = "Inventory levels are healthy across core categories. I detected 2 products nearing their low-stock thresholds. Check the inventory management console for details.";
    }
    
    return { answer, confidence: 0.95 };
  });

export const getBusinessInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return [
      { type: "revenue_trend", title: "Mombasa Branch Growth", description: "Revenue is up 12% at the Mombasa branch over the last 14 days.", severity: "info" },
      { type: "stock_alert", title: "Low Stock Alert", description: "2 products have fallen below their safety threshold of 10 items.", severity: "warning" }
    ];
  });
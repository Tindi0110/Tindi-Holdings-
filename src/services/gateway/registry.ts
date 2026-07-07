export const SERVICE_REGISTRY = {
  platformName: "Tindi Holdings Core Platform",
  version: "2.0.0",
  services: [
    { name: "auth", status: "active", version: "2.0.0", description: "Authentication & Session management" },
    { name: "user", status: "active", version: "2.0.0", description: "User profiles & roles manager" },
    { name: "branch", status: "active", version: "2.0.0", description: "Branch settings and routing metadata" },
    { name: "product", status: "active", version: "2.0.0", description: "Storefront catalog & categories" },
    { name: "inventory", status: "active", version: "2.0.0", description: "Stock adjustments & alert systems" },
    { name: "cart", status: "active", version: "2.0.0", description: "Customer carts management" },
    { name: "order", status: "active", version: "2.0.0", description: "Orders lifecycle ledger" },
    { name: "checkout", status: "active", version: "2.0.0", description: "Order creation, taxation and validation" },
    { name: "payment", status: "active", version: "2.0.0", description: "Stripe & COD billing flows" },
    { name: "receipt-service", status: "active", version: "2.0.0", description: "Immutable documents ledger" },
    { name: "shipping", status: "active", version: "2.0.0", description: "Courier & delivery status tracking" },
    { name: "notification", status: "active", version: "2.0.0", description: "Broadcast and unicast user alerts" },
    { name: "returns", status: "active", version: "2.0.0", description: "Product return requests ledger" },
    { name: "reporting", status: "active", version: "2.0.0", description: "KPI aggregators and revenue charts" },
    { name: "audit", status: "active", version: "2.0.0", description: "Telemetry loggers and activity trace" },
    { name: "loyalty", status: "active", version: "2.0.0", description: "Loyalty point metrics" },
    { name: "search", status: "active", version: "2.0.0", description: "Storefront search & suggestions" },
    { name: "settings", status: "active", version: "2.0.0", description: "Branding settings & feature flags" },
    { name: "storage", status: "active", version: "2.0.0", description: "Asset upload & URL resolutions" },
    { name: "supplier", status: "stub", version: "2.0.0", description: "Supplier records stub (migration pending)" },
    { name: "ai", status: "stub", version: "2.0.0", description: "Gemini conversational assistant stub" },
    { name: "recommendation", status: "active", version: "2.0.0", description: "Storefront product recommendations engine" }
  ]
};
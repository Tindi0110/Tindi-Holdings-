import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Building2,
  ShoppingBag,
  ChevronDown,
  LogOut,
  Tags,
  Boxes,
  Users,
  Ticket,
  Star,
  Undo2,
  Megaphone,
  BarChart3,
  FileBarChart,
  ShieldCheck,
  Settings,
  ScrollText,
  Search,
  Bell,
  MessageSquare,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics } from "@/lib/admin.functions";
import { BranchSelector } from "@/components/shared/BranchSelector";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Sub = { label: string; to?: string };
type Item = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  to?: string;
  badge?: string;
  children?: Sub[];
};
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        to: "/admin/",
      },
      {
        label: "Analytics",
        icon: BarChart3,
        children: [
          { label: "Sales", to: "/admin/analytics/sales" },
          { label: "Customers", to: "/admin/analytics/customers" },
          { label: "Products", to: "/admin/analytics/products" },
          { label: "Branches", to: "/admin/analytics/branches" },
          { label: "Revenue", to: "/admin/analytics/revenue" },
          { label: "Conversion", to: "/admin/analytics/conversion" },
          { label: "Performance", to: "/admin/analytics/performance" },
        ],
      },
      {
        label: "Reports",
        icon: FileBarChart,
        children: [
          { label: "Sales", to: "/admin/reports/sales" },
          { label: "Inventory", to: "/admin/reports/inventory" },
          { label: "Customers", to: "/admin/reports/customers" },
          { label: "Branches", to: "/admin/reports/branches" },
          { label: "Tax", to: "/admin/reports/tax" },
          { label: "Financial", to: "/admin/reports/financial" },
          { label: "Exports", to: "/admin/reports/exports" },
        ],
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Orders",
        icon: ShoppingCart,
        to: "/admin/orders",
        badge: "New",
        children: [
          { label: "All Orders", to: "/admin/orders" },
          { label: "Pending", to: "/admin/orders?status=pending" },
          { label: "Processing", to: "/admin/orders?status=processing" },
          { label: "Completed", to: "/admin/orders?status=completed" },
          { label: "Cancelled", to: "/admin/orders?status=cancelled" },
          { label: "Refunds", to: "/admin/commerce/orders/refunds" },
          { label: "Invoices", to: "/admin/commerce/orders/invoices" },
        ],
      },
      {
        label: "Receipts",
        icon: ScrollText,
        to: "/admin/receipts",
      },
      {
        label: "Products",
        icon: Package,
        to: "/admin/products",
        children: [
          { label: "All Products", to: "/admin/products" },
          { label: "Add Product", to: "/admin/products?new=true" },
          { label: "Drafts", to: "/admin/commerce/products/drafts" },
          { label: "Archived", to: "/admin/commerce/products/archived" },
          { label: "Brands", to: "/admin/commerce/products/brands" },
          { label: "Attributes", to: "/admin/commerce/products/attributes" },
          { label: "Bulk Upload", to: "/admin/commerce/products/upload" },
        ],
      },
      {
        label: "Categories",
        icon: Tags,
        children: [
          { label: "All Categories", to: "/admin/commerce/categories/all" },
          { label: "Add Category", to: "/admin/commerce/categories/new" },
          { label: "Sub Categories", to: "/admin/commerce/categories/sub" },
          { label: "Sorting", to: "/admin/commerce/categories/sort" },
          { label: "Analytics", to: "/admin/commerce/categories/analytics" },
        ],
      },
      {
        label: "Inventory",
        icon: Boxes,
        children: [
          { label: "Stock Levels", to: "/admin/commerce/inventory/stock" },
          { label: "Transfers", to: "/admin/commerce/inventory/transfers" },
          { label: "Adjustments", to: "/admin/commerce/inventory/adjust" },
          { label: "Warehouses", to: "/admin/commerce/inventory/warehouses" },
          { label: "Low Stock Alerts", to: "/admin/commerce/inventory/alerts" },
          { label: "History", to: "/admin/commerce/inventory/history" },
          { label: "Forecasting", to: "/admin/commerce/inventory/forecast" },
        ],
      },
      {
        label: "Branches",
        icon: Building2,
        to: "/admin/branches",
        children: [
          { label: "All Branches", to: "/admin/branches" },
          { label: "Analytics", to: "/admin/commerce/branches/analytics" },
          { label: "Branch Inventory", to: "/admin/commerce/branches/inventory" },
          { label: "Staff", to: "/admin/commerce/branches/staff" },
          { label: "Transfers", to: "/admin/commerce/branches/transfers" },
          { label: "Performance", to: "/admin/commerce/branches/performance" },
          { label: "Settings", to: "/admin/commerce/branches/settings" },
        ],
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        label: "Customers",
        icon: Users,
        children: [
          { label: "All Customers", to: "/admin/customers/all" },
          { label: "Customer Groups", to: "/admin/customers/groups" },
          { label: "VIP Customers", to: "/admin/customers/vip" },
          { label: "Analytics", to: "/admin/customers/analytics" },
          { label: "Support Tickets", to: "/admin/tickets" },
          { label: "Activity", to: "/admin/customers/activity" },
        ],
      },
      {
        label: "Reviews",
        icon: Star,
        children: [
          { label: "All Reviews", to: "/admin/customers/reviews/all" },
          { label: "Pending", to: "/admin/customers/reviews/pending" },
          { label: "Approved", to: "/admin/customers/reviews/approved" },
          { label: "Reported", to: "/admin/customers/reviews/reported" },
          { label: "Analytics", to: "/admin/customers/reviews/analytics" },
        ],
      },
      {
        label: "Returns",
        icon: Undo2,
        children: [
          { label: "Return Requests", to: "/admin/customers/returns/requests" },
          { label: "Refund Requests", to: "/admin/customers/returns/refunds" },
          { label: "Approved", to: "/admin/customers/returns/approved" },
          { label: "Rejected", to: "/admin/customers/returns/rejected" },
          { label: "Analytics", to: "/admin/customers/returns/analytics" },
        ],
      },
    ],
  },
  {
    label: "Growth",
    items: [
      {
        label: "Coupons",
        icon: Ticket,
        children: [
          { label: "All Coupons", to: "/admin/growth/coupons/all" },
          { label: "Create", to: "/admin/growth/coupons/new" },
          { label: "Promotions", to: "/admin/growth/coupons/promo" },
          { label: "Flash Sales", to: "/admin/growth/coupons/flash" },
          { label: "Discount Rules", to: "/admin/growth/coupons/rules" },
          { label: "Campaigns", to: "/admin/growth/coupons/campaigns" },
        ],
      },
      {
        label: "Marketing",
        icon: Megaphone,
        children: [
          { label: "Email Campaigns", to: "/admin/growth/marketing/email" },
          { label: "SMS Campaigns", to: "/admin/growth/marketing/sms" },
          { label: "Push Notifications", to: "/admin/growth/marketing/push" },
          { label: "Social Campaigns", to: "/admin/growth/marketing/social" },
          { label: "Referral Program", to: "/admin/growth/marketing/referral" },
          { label: "Automation", to: "/admin/growth/marketing/automation" },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Users & Roles",
        icon: ShieldCheck,
        children: [
          { label: "Admin Users", to: "/admin/system/users/admin" },
          { label: "Managers", to: "/admin/system/users/managers" },
          { label: "Branch Staff", to: "/admin/system/users/staff" },
          { label: "Permissions", to: "/admin/system/users/permissions" },
          { label: "Role Management", to: "/admin/system/users/roles" },
          { label: "Access Logs", to: "/admin/system/users/logs" },
        ],
      },
      {
        label: "Settings",
        icon: Settings,
        children: [
          { label: "General", to: "/admin/system/settings/general" },
          { label: "Store", to: "/admin/system/settings/store" },
          { label: "Payment", to: "/admin/system/settings/payment" },
          { label: "Shipping", to: "/admin/system/settings/shipping" },
          { label: "Tax", to: "/admin/system/settings/tax" },
          { label: "Notifications", to: "/admin/system/settings/notifications" },
          { label: "Security", to: "/admin/system/settings/security" },
          { label: "API", to: "/admin/system/settings/api" },
        ],
      },
      {
        label: "System Logs",
        icon: ScrollText,
        children: [
          { label: "Activity Logs", to: "/admin/system/logs/activity" },
          { label: "Audit Logs", to: "/admin/system/logs/audit" },
          { label: "Error Logs", to: "/admin/system/logs/error" },
          { label: "Login History", to: "/admin/system/logs/login" },
          { label: "Security Events", to: "/admin/system/logs/security" },
          { label: "API Logs", to: "/admin/system/logs/api" },
        ],
      },
    ],
  },
];

const allItems = groups.flatMap((g) => g.items);

const getActiveState = (path: string) => {
  const normPath = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

  for (const group of groups) {
    for (const item of group.items) {
      if (item.children) {
        for (const child of item.children) {
          if (child.to) {
            const childPath = child.to.split("?")[0];
            const normChild = childPath.length > 1 && childPath.endsWith("/") ? childPath.slice(0, -1) : childPath;
            if (normPath === normChild || normPath.startsWith(normChild + "/")) {
              return { parentLabel: item.label, isSubActive: true, activeChildTo: child.to };
            }
          }
        }
      }
      if (item.to) {
        const itemPath = item.to.split("?")[0];
        const normItem = itemPath.length > 1 && itemPath.endsWith("/") ? itemPath.slice(0, -1) : itemPath;
        if (normItem === "/admin" || normItem === "/admin/") {
          if (normPath === "/admin" || normPath === "/admin/") {
            return { parentLabel: item.label, isSubActive: false, activeChildTo: null };
          }
        } else {
          if (normPath === normItem || normPath.startsWith(normItem + "/")) {
            return { parentLabel: item.label, isSubActive: false, activeChildTo: null };
          }
        }
      }
    }
  }
  return { parentLabel: "Dashboard", isSubActive: false, activeChildTo: null };
};

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: metrics } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => getDashboardMetrics(),
    refetchInterval: 30000, // Refresh every 30s for "real-time" feel
  });

  const activeState = getActiveState(path);
  const [open, setOpen] = useState<string | null>(activeState.parentLabel);
  const initials = (user?.email ?? "A").slice(0, 2).toUpperCase();

  // Inject dynamic badges from real-time data
  const getBadge = (label: string) => {
    if (label === "Orders" && metrics?.pendingCount) return String(metrics.pendingCount);
    if (label === "Inventory" && metrics?.lowStockCount) return String(metrics.lowStockCount);
    if (label === "Customers" && metrics?.customersCount) return String(metrics.customersCount);
    return null;
  };

  useEffect(() => {
    if (collapsed) {
      setOpen(null);
    } else if (activeState.parentLabel) {
      setOpen(activeState.parentLabel);
    }
  }, [path, collapsed]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="h-full flex flex-col bg-card text-foreground border-r border-border">
        {/* Brand */}
        <Link
          to="/"
          onClick={onNavigate}
          className={`px-4 py-6 border-b border-border flex items-center gap-2.5 shrink-0 group ${collapsed ? "justify-center px-2" : ""}`}
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm shadow-primary/5">
            <div className="text-primary font-sans font-black text-lg">T</div>
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0"
            >
              <div className="text-[14px] font-black leading-none tracking-[0.1em] text-foreground uppercase font-display">
                Tindi Group
              </div>
              <div className="text-[9.5px] text-primary font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5 opacity-80">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Executive Admin
              </div>
            </motion.div>
          )}
        </Link>

        {/* Nav */}
        <nav data-lenis-prevent className={`flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`}>
          {groups.map((g, gi) => (
            <motion.div
              key={g.label}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-6"
            >
              {!collapsed && (
                <motion.div
                  variants={itemVariants}
                  className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground px-3 pt-2 pb-2.5"
                >
                  {g.label}
                </motion.div>
              )}
              {collapsed && <div className="mx-2 mb-4 h-px bg-border first:hidden" />}
              {g.items.map((m, mi) => {
                const isParentActive = activeState.parentLabel === m.label;
                const isOpen = open === m.label;
                const hasChildren = Boolean(m.children && m.children.length > 0);
                const dynamicBadge = getBadge(m.label);

                const baseRow = `w-full flex items-center gap-3 rounded-xl text-[13px] font-semibold transition-all duration-300 relative group/item ${
                  isParentActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`;

                if (collapsed) {
                  const Btn = (
                    <Link
                      to={(m.to || m.children?.[0]?.to) ?? "/admin/"}
                      onClick={onNavigate}
                      className={`${baseRow} justify-center h-10 w-10 mx-auto`}
                      aria-label={m.label}
                    >
                      <m.icon className="h-[18px] w-[18px]" />
                      {dynamicBadge && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full ring-2 ring-white" />
                      )}
                    </Link>
                  );
                  return (
                    <Tooltip key={m.label}>
                      <TooltipTrigger asChild>{Btn}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="font-medium bg-navy text-navy-foreground border-none"
                      >
                        {m.label}
                        {dynamicBadge && <span className="ml-2 opacity-50">({dynamicBadge})</span>}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                if (!hasChildren) {
                  return (
                    <motion.div key={m.label} variants={itemVariants} className="mb-1">
                      <Link
                        to={m.to ?? "/admin/"}
                        onClick={onNavigate}
                        className={`${baseRow} px-3.5 py-2.5`}
                      >
                        <m.icon
                          className={`h-[18px] w-[18px] shrink-0 transition-transform duration-300 ${isParentActive ? "" : "group-hover/item:scale-110"}`}
                        />
                        <span className="flex-1 text-left truncate">{m.label}</span>
                        {(m.badge || dynamicBadge) && (
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm ${m.label === "Inventory" ? "bg-error text-white" : "bg-primary/10 border border-primary/20 text-primary"}`}
                          >
                            {dynamicBadge || m.badge}
                          </span>
                        )}
                        {isParentActive && !collapsed && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute left-[-2px] top-2 bottom-2 w-1 bg-primary rounded-r-full"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                }

                return (
                  <motion.div key={m.label} variants={itemVariants} className="mb-1">
                    <button
                      onClick={() => {
                        setOpen(isOpen ? null : m.label);
                        if (m.to && path !== m.to) {
                          navigate({ to: m.to as any });
                        }
                      }}
                      className={`${baseRow} px-3.5 py-2.5 cursor-pointer`}
                    >
                      <m.icon
                        className={`h-[18px] w-[18px] shrink-0 transition-transform duration-300 ${isParentActive ? "" : "group-hover/item:scale-110"}`}
                      />
                      <span className="flex-1 text-left truncate">{m.label}</span>
                      {(m.badge || dynamicBadge) && (
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm ${m.label === "Inventory" ? "bg-error text-white" : "bg-primary/10 border border-primary/20 text-primary"}`}
                        >
                          {dynamicBadge || m.badge}
                        </span>
                      )}
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                      {isParentActive && !collapsed && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute left-[-2px] top-2 bottom-2 w-1 bg-primary rounded-r-full"
                        />
                      )}
                    </button>
                    <AnimatePresence>
                      {isOpen && m.children && !collapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="ml-[22px] mt-1 mb-2 pl-3.5 border-l border-border space-y-0.5">
                            {m.children.map((c) => {
                              const subActive = c.to ? (path === c.to || activeState.activeChildTo === c.to) : false;
                              const cls = `block px-3 py-1.5 rounded-lg text-[12px] transition-all duration-200 ${
                                subActive
                                  ? "text-primary bg-primary/5 font-bold shadow-sm"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`;
                              return c.to ? (
                                <Link key={c.label} to={c.to} onClick={onNavigate} className={cls}>
                                  {c.label}
                                </Link>
                              ) : (
                                <div
                                  key={c.label}
                                  className={`${cls} cursor-default opacity-40 italic`}
                                >
                                  {c.label}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </nav>

        {/* Footer / Profile */}
        <div
          className={`border-t border-border shrink-0 ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                  className="mx-auto h-10 w-10 rounded-lg grid place-items-center hover:bg-muted text-muted-foreground hover:text-foreground"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-conversion grid place-items-center text-xs font-bold shrink-0 text-primary-foreground">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate text-foreground">{user?.email}</div>
                <div className="text-[11px] text-muted-foreground font-medium">Administrator</div>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
                className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("admin.sidebar.collapsed") === "1";
  });
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("admin.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const { user } = useAuth();
  const initials = (user?.email ?? "A").slice(0, 2).toUpperCase();
  const sidebarWidth = collapsed ? 72 : 264;
  const activeItem = allItems.find((m) => {
    // Check if current path matches item's main link or any of its children
    const matchesMain = m.to && (path === m.to || (m.to !== "/admin" && path.startsWith(m.to)));
    const matchesChild = m.children?.some(
      (c) => c.to && (path === c.to.split("?")[0] || path.startsWith(c.to.split("?")[0] + "/")),
    );
    return matchesMain || matchesChild;
  });

  const subLinks = activeItem?.children || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden lg:block transition-[width] duration-200 ease-out border-r border-border bg-card"
        style={{ width: sidebarWidth }}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-xl bg-card">
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div
        className="flex flex-col min-h-screen min-w-0 transition-[margin] duration-200 ease-out lg:ml-[var(--admin-sidebar-w)]"
        style={{ ["--admin-sidebar-w" as never]: `${sidebarWidth}px` }}
      >
        <header className="h-16 bg-card border-b border-border flex items-center px-4 md:px-6 gap-2 sticky top-0 z-20 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex text-muted-foreground hover:text-foreground"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
          <div className="hidden sm:flex flex-col leading-tight">
            <h1 className="text-[15px] md:text-base font-display font-black tracking-tight uppercase">
              {title}
            </h1>
            <span className="text-[9px] font-black tracking-[0.05em] text-muted-foreground uppercase opacity-40">
              Innovation • Synergy • Scale — Building the Future Through Excellence
            </span>
          </div>
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search orders, products, customers…"
                className="w-full h-10 pl-9 pr-12 rounded-xl bg-section border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center h-5 px-1.5 rounded border border-border bg-card text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden md:block">
              <BranchSelector variant="admin" />
            </div>
            <Button variant="ghost" size="icon" className="relative" aria-label="Messages">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-card" />
            </Button>
            <Link
              to="/"
              className="hidden md:flex h-9 px-3 items-center rounded-lg border border-border text-xs font-medium hover:bg-section transition-colors"
            >
              View Store
            </Link>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-conversion grid place-items-center text-xs font-bold text-white ring-2 ring-card">
              {initials}
            </div>
          </div>
        </header>
        {/* Horizontal Sub-header */}
        {subLinks.length > 0 && (
          <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-16 z-10">
            <div className="mx-auto px-4 md:px-6">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
                {subLinks.map((item) => {
                  if (!item.to) return null;
                  const itemPath = item.to.split("?")[0];
                  const isActive = path === itemPath;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// Backwards compatible export (still used by routes that import it directly)
export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-[264px] z-30 hidden lg:block">
      <SidebarContent collapsed={false} />
    </aside>
  );
}
